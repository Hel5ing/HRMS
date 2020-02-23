import React from 'react';
import { Modal, Card, Divider, Descriptions, Icon, Spin, Rate } from 'antd';
import styles from './Center.less';

interface PersonInfoProps {
  visible: boolean;
  onCancel: () => void;
  reissueCertificate: (personInfo: any) => void;
  personInfo: any;
}

class PersonInfoView extends React.Component<PersonInfoProps> {
  render() {
    const { reissueCertificate, onCancel, visible, personInfo } = this.props;

    const onOk = () => {
      reissueCertificate(personInfo);
    };

    return (
      <Modal
        style={{ width: 800 }}
        visible={visible}
        okText="补发证书"
        cancelText="返回"
        onCancel={onCancel}
        onOk={onOk}
      >
        {personInfo ? (
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div className={styles.avatarHolder}>
              <img
                alt=""
                src={'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'}
              />
              <div className={styles.name}>{personInfo.name}</div>
              <div>{personInfo.role ? personInfo.role.name : ''}</div>
            </div>
            <Divider dashed />
            <div className={styles.detail}>
              <p>
                <Icon type="credit-card" theme="filled" />
                {personInfo.employee_id ? personInfo.employee_id : ''}
              </p>
              <p>
                <Icon type="idcard" theme="filled" />
                {personInfo.position ? personInfo.position.name : ''}
              </p>
              <p>
                <Icon type="phone" theme="filled" />
                {personInfo.mobile}
              </p>
              <p>
                <Icon type="mail" theme="filled" />
                {personInfo.email}
              </p>
              {personInfo.education ? (
                <p>
                  <Icon type="read" theme="filled" /> personInfo.education
                </p>
              ) : (
                ''
              )}
              <p>
                <Icon type="contacts" />
                {personInfo.status ? personInfo.status.name : ''}
              </p>
              <p>
                <Icon type="rise" />
                {personInfo.level
                  ? personInfo.level == 1
                    ? '初级'
                    : personInfo.level == 2
                    ? '中级'
                    : '高级'
                  : '初级'}
              </p>
            </div>
            {personInfo.star ? (
              <div>
                <Rate defaultValue={personInfo.star} disabled={true} />
              </div>
            ) : (
              <div>
                <Rate defaultValue={0} disabled={true} />
              </div>
            )}
            <Divider dashed />
            <Descriptions
              title="站点信息"
              bordered
              column={2}
              layout="vertical"
              style={{ marginBottom: 32 }}
            >
              <Descriptions.Item label="站点名称">
                {personInfo.site ? personInfo.site.name : ''}
              </Descriptions.Item>
              <Descriptions.Item label="站点渠道">
                {personInfo.site ? personInfo.site.channel : ''}
              </Descriptions.Item>
              <Descriptions.Item label="站点省份">
                {personInfo.site
                  ? personInfo.site.province + personInfo.site.city + personInfo.site.district
                  : ''}
              </Descriptions.Item>
              <Descriptions.Item label="详细地址">
                {personInfo.site ? personInfo.site.address : ''}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {personInfo.site ? personInfo.site.created_at : ''}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <Spin />
        )}
      </Modal>
    );
  }
}

export default PersonInfoView;
