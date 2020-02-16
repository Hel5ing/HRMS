import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component, Fragment } from 'react';

import { List } from 'antd';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: (
    <span className="strong">
      <FormattedMessage id="groupmanageandsettings.security.strong" defaultMessage="Strong" />
    </span>
  ),
  medium: (
    <span className="medium">
      <FormattedMessage id="groupmanageandsettings.security.medium" defaultMessage="Medium" />
    </span>
  ),
  weak: (
    <span className="weak">
      <FormattedMessage id="groupmanageandsettings.security.weak" defaultMessage="Weak" />
      Weak
    </span>
  ),
};

class SecurityView extends Component {
  getData = () => [
    {
      title: formatMessage({ id: 'groupmanageandsettings.security.password' }, {}),
      description: (
        <Fragment>
          {formatMessage({ id: 'groupmanageandsettings.security.password-description' })}：
          {passwordStrength.strong}
        </Fragment>
      ),
      actions: [
        <a key="Modify">
          <FormattedMessage id="groupmanageandsettings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'groupmanageandsettings.security.phone' }, {}),
      description: `${formatMessage(
        { id: 'groupmanageandsettings.security.phone-description' },
        {},
      )}：138****8293`,
      actions: [
        <a key="Modify">
          <FormattedMessage id="groupmanageandsettings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'groupmanageandsettings.security.question' }, {}),
      description: formatMessage({ id: 'groupmanageandsettings.security.question-description' }, {}),
      actions: [
        <a key="Set">
          <FormattedMessage id="groupmanageandsettings.security.set" defaultMessage="Set" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'groupmanageandsettings.security.email' }, {}),
      description: `${formatMessage(
        { id: 'groupmanageandsettings.security.email-description' },
        {},
      )}：ant***sign.com`,
      actions: [
        <a key="Modify">
          <FormattedMessage id="groupmanageandsettings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'groupmanageandsettings.security.mfa' }, {}),
      description: formatMessage({ id: 'groupmanageandsettings.security.mfa-description' }, {}),
      actions: [
        <a key="bind">
          <FormattedMessage id="groupmanageandsettings.security.bind" defaultMessage="Bind" />
        </a>,
      ],
    },
  ];

  render() {
    const data = this.getData();
    return (
      <Fragment>
        <List<Unpacked<typeof data>>
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default SecurityView;
