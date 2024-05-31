import React, { ChangeEvent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { EditorField, EditorRow } from '@grafana/plugin-ui';
import { Input } from '@grafana/ui';

import { DataSource } from '../datasource';
import { GoogleCalendarQuery } from '../types';

export type Props = QueryEditorProps<DataSource, GoogleCalendarQuery>;

export const AnnotationQueryEditor = (props: Props) => {
  const { query, onChange } = props;

  return (
    <>
      <EditorRow>
        <EditorField label="Calendar Id" width={16}>
          <Input
            value={query.calendarId || ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange({ ...query, calendarId: event.target.value })}
          />
        </EditorField>
      </EditorRow>
    </>
  );
};
