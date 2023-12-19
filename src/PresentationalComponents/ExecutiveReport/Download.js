import './_Download.scss';
import PropTypes from 'prop-types';
import {
  RULES_FETCH_URL,
  STATS_REPORTS_FETCH_URL,
  STATS_SYSTEMS_FETCH_URL,
  exportNotifications,
} from '../../AppConstants';
import React, { useState } from 'react';

import { DownloadButtonWrapper } from '@redhat-cloud-services/frontend-components-pdf-generator/dist/esm/index';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux/actions/notifications';
import ExportIcon from '@patternfly/react-icons/dist/esm/icons/export-icon';
import { Get } from '../../Utilities/Api';
import messages from '../../Messages';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { BuildExecReport } from './BuildExecReport';

const DownloadExecReport = ({ isDisabled }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const dataFetch = async () => {
    setLoading(true);
    dispatch(addNotification(exportNotifications.pending));

    try {
      const [statsSystems, statsReports, topActiveRec] = (
        await Promise.all([
          Get(STATS_SYSTEMS_FETCH_URL),
          Get(STATS_REPORTS_FETCH_URL),
          Get(
            RULES_FETCH_URL,
            {},
            { limit: 3, sort: '-total_risk,-impacted_count', impacting: true }
          ),
        ])
      ).map(({ data }) => data);

      console.log(statsSystems, statsReports, topActiveRec, 'pdf debug: data');
      const report = (
        <BuildExecReport
          statsReports={statsReports}
          statsSystems={statsSystems}
          topActiveRec={topActiveRec}
          intl={intl}
        />
      );

      console.log(report, 'pdf debug: report');

      setLoading(false);

      console.log(loading, 'pdf debug: loading');

      dispatch(addNotification(exportNotifications.success));

      return [report];
    } catch (e) {
      setLoading(false);
      console.log(e, 'pdf debug: error');
      dispatch(addNotification(exportNotifications.error));

      return [];
    }
  };

  return (
    <DownloadButtonWrapper
      groupName={intl.formatMessage(messages.redHatInsights)}
      label={
        loading
          ? intl.formatMessage(messages.loading)
          : intl.formatMessage(messages.downloadExecutiveLabel)
      }
      asyncFunction={dataFetch}
      buttonProps={{
        variant: 'link',
        icon: <ExportIcon className="iconOverride" />,
        component: 'a',
        className: 'downloadButtonOverride',
        isAriaDisabled: isDisabled,
        ...(loading ? { isDisabled: true } : null),
      }}
      type={intl.formatMessage(messages.insightsHeader)}
      fileName={`Advisor-Executive-Report--${new Date()
        .toUTCString()
        .replace(/ /g, '-')}.pdf`}
    />
  );
};

DownloadExecReport.propTypes = {
  isDisabled: PropTypes.bool,
};

export default DownloadExecReport;
