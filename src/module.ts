import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { GoogleCalendarQuery, GoogleCalendarDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, GoogleCalendarQuery, GoogleCalendarDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
