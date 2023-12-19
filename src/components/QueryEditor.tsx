import React, { ChangeEvent } from 'react';
import { InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { GoogleCalendarDataSourceOptions, GoogleCalendarQuery } from '../types';

type Props = QueryEditorProps<DataSource, GoogleCalendarQuery, GoogleCalendarDataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {
  const onCalendarIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, calendarId: event.target.value });
  };

  const { calendarId } = query;

  return (
    <div className="gf-form">
      <InlineField label="Calender ID" labelWidth={16}>
        <Input onChange={onCalendarIdChange} value={calendarId || ''} />
      </InlineField>
    </div>
  );
}
