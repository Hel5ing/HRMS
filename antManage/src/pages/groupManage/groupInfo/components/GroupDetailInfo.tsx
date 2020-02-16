import React from 'react';
import { Modal, Card, Divider, Descriptions, Icon, Spin } from 'antd';

import styles from './Center.less';

interface GroupInfoProps {
  visible: boolean;
  onCancel: () => void;
  detailInfo: any;
}

class GroupDetailInfo extends React.Component<GroupInfoProps> {
  render() {
    const { onCancel, visible, detailInfo } = this.props;

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
              <div className={styles.name}>{detailInfo.name}</div>
              <div>{detailInfo.channel}</div>
            </div>
            <Divider dashed />
            {detailInfo.admin.map((data: any) => {
              let personInfo = data.person;
              return (
                <Descriptions
                  title="管理员信息"
                  bordered
                  column={2}
                  layout="vertical"
                  style={{ marginBottom: 32 }}
                  key={personInfo.id}
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

export default GroupDetailInfo;
