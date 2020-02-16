import React from 'react';
import { Modal, Card, Divider, Descriptions, Spin } from 'antd';

import styles from './Center.less';

interface DetailInfoProps {
  visible: boolean;
  onCancel: () => void;
  detailInfo: any;
}

class DetailInfo extends React.Component<DetailInfoProps> {
  render() {
    const { onCancel, visible, detailInfo } = this.props;

    const creatPerson: any = (detailInfo && detailInfo.authority.engineer) ? detailInfo.authority.engineer : null;
    const publishedPerson: any = (detailInfo && detailInfo.suspend_by) ? detailInfo.suspend_by : null;
    return (
      <Modal
        style={{ width: 800 }}
        visible={visible}
        okText="确定"
        cancelText="返回"
        onCancel={onCancel}
        onOk={onCancel}
      >
        {detailInfo ? (
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div className={styles.avatarHolder}>
              <div className={styles.name}>产品权限暂停</div>
            </div>

            <Descriptions column={2}>
              <Descriptions.Item label="暂停时间">{detailInfo.created_at}</Descriptions.Item>
              <Descriptions.Item label="暂停原因">{detailInfo.reason}</Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            <div>
              <Descriptions
                title="暂停人员"
                bordered
                column={2}
                layout="vertical"
                style={{ marginBottom: 10 }}
              >
                <Descriptions.Item label="姓名">
                  {creatPerson ? creatPerson.name : ''}
                </Descriptions.Item>
                <Descriptions.Item label="联系方式">
                  {creatPerson ? creatPerson.mobile : ''}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {creatPerson ? creatPerson.email : ''}
                </Descriptions.Item>
              </Descriptions>
              <Divider dashed />
            </div>

            {publishedPerson ? (
              <div>
                <Descriptions
                  title="创建人"
                  bordered
                  column={2}
                  layout="vertical"
                  style={{ marginBottom: 10 }}
                >
                  <Descriptions.Item label="姓名">
                    {publishedPerson ? publishedPerson.name : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="联系方式">
                    {publishedPerson ? publishedPerson.mobile : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱">
                    {publishedPerson ? publishedPerson.email : ''}
                  </Descriptions.Item>
                </Descriptions>
                <Divider dashed />
              </div>
            ) : null}
          </Card>
        ) : (
          <Spin />
        )}
      </Modal>
    );
  }
}

export default DetailInfo;
