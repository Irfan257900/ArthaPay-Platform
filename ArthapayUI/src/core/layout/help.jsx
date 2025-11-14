import { Tooltip } from 'antd';
import React, { useCallback } from 'react';

const HelpPage = ({ helpLink = '' }) => {

  const openHelpPage = useCallback(() => {
    // Check if helpLink is provided and use it directly.
    if (helpLink) {
      // The helpLink is assumed to be the full external URL (e.g., https://...).
      window.open(helpLink, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback or default behavior if no link is provided (e.g., open a base documentation page)
      // You might adjust this fallback based on your requirements.
      window.open('/docs/', '_blank', 'noopener,noreferrer');
    }
  }, [helpLink]);

  return (
    <Tooltip
      placement="left"
      title="User guide"
      className=''
      onClick={openHelpPage}
    >
      <span className='icon question-mark-icon cursor-pointer'></span>
    </Tooltip>
  );
};

export default HelpPage;