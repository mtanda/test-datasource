import {
  DataSourceApi,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceInstanceSettings,
  TestDataSourceResponse,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { GoogleCalendarQuery, GoogleCalendarDataSourceOptions } from './types';
import _ from 'lodash';
import { parse, parseISO } from 'date-fns';

export class DataSource extends DataSourceApi<GoogleCalendarQuery, GoogleCalendarDataSourceOptions> {
  loaded: boolean;
  initialized: boolean;
  clientId: string;

  constructor(instanceSettings: DataSourceInstanceSettings<GoogleCalendarDataSourceOptions>) {
    super(instanceSettings);
    this.loaded = false;
    this.initialized = false;
    this.clientId = instanceSettings.jsonData.clientId || '';
  }

  async loadScript(url: string) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    return new Promise(resolve => {
      script.onload = resolve;
    })
  }

  async load() {
    if (this.loaded) {
      return;
    }

    await this.loadScript("https://accounts.google.com/gsi/client");
    await this.loadScript("https://apis.google.com/js/api.js");

    this.loaded = true;
  }

  async testDatasource(): Promise<TestDataSourceResponse> {
    try {
      await this.initialize();
      return { status: 'success', message: 'Data source is working' };
    } catch (error: any) {
      console.error(error);
      return { status: 'error', message: error.message };
    }
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.load();
    await new Promise((resolve, reject) => {
      gapi.load('client', { callback: resolve, onerror: reject });
    });
    await gapi.client.init({}).then(() => {
      gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest');
    });
    const client: any = await new Promise((resolve, reject) => {
      /* @ts-ignore */
      resolve(google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        prompt: 'consent',
        callback: '',
      }));
    });
    await new Promise((resolve, reject) => {
      client.callback = (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
        } else {
          gapi.client.getToken();
          resolve(resp);
        }
      };
      client.requestAccessToken();
    });

    this.initialized = true;
  }

  async query(options: DataQueryRequest<GoogleCalendarQuery>): Promise<DataQueryResponse> {
    await this.initialize();
    const eventList: any = await Promise.all(
      options.targets
        .filter(t => !t.hide && t.calendarId)
        .map(async t => {
          const params = {
            calendarId: t.calendarId,
            timeMin: options.range.from.toISOString(),
            timeMax: options.range.to.toISOString(),
            orderBy: 'startTime',
            showDeleted: false,
            singleEvents: true,
            maxResults: 250,
          };

          const events = await this.getEvents(params);
          /* @ts-ignore */
          events.refId = t.refId;
          events.sort((a, b) => {
            return this.parseTime(a.start) > this.parseTime(b.start) ? 1 : -1;
          });

          return events;
        })
    );

    const data = eventList.map((events: any) => {
      const frame = new MutableDataFrame({
        refId: events.refId,
        fields: [
          { name: 'startTime', type: FieldType.time },
          { name: 'endTime', type: FieldType.time },
          { name: 'summary', type: FieldType.string },
          { name: 'displayName', type: FieldType.string },
          { name: 'description', type: FieldType.string },
        ],
      });

      events.forEach((event: any) => {
        const start = this.parseTime(event.start);
        const end = this.parseTime(event.end);
        frame.add({
          startTime: start,
          endTime: end,
          summary: event.summary,
          displayName: event.organizer.displayName,
          description: event.description || '',
        })
      });

      return frame;
    });

    return { data };
  }

  async getEvents(params: any): Promise<gapi.client.calendar.Event[]> {
    const response = await gapi.client.calendar.events.list(params);
    return response.result.items;
  }

  parseTime(a: any): Date {
    if (a.dateTime) {
      return parseISO(a.dateTime.slice(0, 19));
    } else if (a.date) {
      return parse(a.date, 'yyyy-mm-dd', new Date());
    } else {
      throw new Error('Invalid time format');
    }
  }
}
