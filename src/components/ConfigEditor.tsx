import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { GoogleCalendarDataSourceOptions, GoogleCalendarSecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<GoogleCalendarDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onClientIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      clientId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  const onServiceAccountKeyFilePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        serviceAccountKeyFilePath: event.target.value,
      },
    });
  };

  const onResetServiceAccountKeyFilePath = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        serviceAccountKeyFilePath: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        serviceAccountKeyFilePath: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as GoogleCalendarSecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="Client ID" labelWidth={20}>
        <Input
          onChange={onClientIdChange}
          value={jsonData.clientId || ''}
          placeholder="json field returned to frontend"
          width={75}
        />
      </InlineField>
      <InlineField label="Service account key file" labelWidth={20}>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.serviceAccountKeyFilePath) as boolean}
          value={secureJsonData.serviceAccountKeyFilePath || ''}
          placeholder="secure json field (backend only)"
          width={75}
          onReset={onResetServiceAccountKeyFilePath}
          onChange={onServiceAccountKeyFilePathChange}
        />
      </InlineField>
    </div>
  );
}
