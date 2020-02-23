import React from 'react';
import { Modal, Card, Divider, Descriptions, Icon, Spin } from 'antd';

import styles from './Center.less';

interface PersonInfoProps {
  visible: boolean;
  onCancel: () => void;
  siteInfo: any;
}

class SiteInfoView extends React.Component<PersonInfoProps> {
  render() {
    const { onCancel, visible, siteInfo } = this.props;

    return (
      <Modal
        style={{ width: 800 }}
        visible={visible}
        okText="确定"
        cancelText="返回"
        onCancel={onCancel}
        onOk={onCancel}
      >
        {siteInfo ? (
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div className={styles.avatarHolder}>
              <div className={styles.name}>{siteInfo.name}</div>
              <div>{siteInfo.channel}</div>
            </div>
            <Divider dashed />
            <div className={styles.detail}>
              <p>
                <Icon type="info-circle" />
                {siteInfo.status ? siteInfo.status.name : ''}
              </p>
              <p>
                <Icon type="bulb" />
                {siteInfo.type ? siteInfo.type.name : ''}
              </p>
              <p>
                <Icon type="environment" />
                {siteInfo.province + siteInfo.city + siteInfo.district + siteInfo.address}
              </p>
              <p>
                <Icon type="clock-circle" />
                {siteInfo.created_at}
              </p>
              <p>
                <Icon type="info-circle" />
                {siteInfo.remark ? siteInfo.remark : ''}
              </p>
            </div>
            <Divider dashed />
            <Descriptions
              title="系统账号信息"
              bordered
              column={2}
              layout="vertical"
              style={{ marginBottom: 32 }}
            >
              <Descriptions.Item label="GCSS ID">
                {siteInfo.gcss_id ? siteInfo.gcss_id : ''}
              </Descriptions.Item>
              <Descriptions.Item label="ESS II NO.">
                {siteInfo.ess_ii_no ? siteInfo.ess_ii_no : ''}
              </Descriptions.Item>
              <Descriptions.Item label="WEBAAS ID(CPC)">
                {siteInfo.cpc_id ? siteInfo.cpc_id : ''}
              </Descriptions.Item>
              <Descriptions.Item label="WEBAAS ID(CIP)">
                {siteInfo.cip_id ? siteInfo.cip_id : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Einstein ID">
                {siteInfo.einstein_id ? siteInfo.einstein_id : ''}
              </Descriptions.Item>
              <Descriptions.Item label="Queue">
                {siteInfo.queue ? siteInfo.queue : ''}
              </Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            {siteInfo.admin.map((data: any) => {
              let personInfo = data.person;
              return (
                <Descriptions
                  title="管理员信息"
                  bordered
                  column={2}
                  layout="vertical"
                  style={{ marginBottom: 32 }}
                >
                  <Descriptions.Item label="姓名">
                    {personInfo ? personInfo.name : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="联系方式">
                    {personInfo ? personInfo.mobile : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱">
                    {personInfo ? personInfo.email : ''}
                  </Descriptions.Item>
                </Descriptions>
              );
            })}
          </Card>
        ) : (
          <Spin />
        )}
      </Modal>
    );
  }
}

export default SiteInfoView;
