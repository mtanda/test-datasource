import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface GoogleCalendarQuery extends DataQuery {
  calendarId: string;
}

export const DEFAULT_QUERY: Partial<GoogleCalendarQuery> = {
  calendarId: '',
};

export interface GoogleCalendarDataSourceOptions extends DataSourceJsonData {
  clientId?: string;
}

export interface GoogleCalendarSecureJsonData {
  serviceAccountKeyFilePath?: string;
}
