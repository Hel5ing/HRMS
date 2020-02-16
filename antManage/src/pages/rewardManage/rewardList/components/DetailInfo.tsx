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
    const targetPerson: any = detailInfo ? detailInfo.target : null;
    const publishedPerson: any = detailInfo ? detailInfo.published_by : null;
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
              <div className={styles.name}>{detailInfo.category.name}</div>
            </div>

            <Descriptions column={2}>
              <Descriptions.Item label="记录编号">{detailInfo.id}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailInfo.created_at}</Descriptions.Item>
              <Descriptions.Item label="备注">{detailInfo.remark}</Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            <div>
              <Descriptions
                title="被奖惩人"
                bordered
                column={2}
                layout="vertical"
                style={{ marginBottom: 10 }}
              >
                <Descriptions.Item label="姓名">
                  {targetPerson ? targetPerson.name : ''}
                </Descriptions.Item>
                <Descriptions.Item label="联系方式">
                  {targetPerson ? targetPerson.mobile : ''}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {targetPerson ? targetPerson.email : ''}
                </Descriptions.Item>
              </Descriptions>
              <Divider dashed />
            </div>

            {publishedPerson ? (
              <div>
                <Descriptions
                  title="信息发布者"
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
