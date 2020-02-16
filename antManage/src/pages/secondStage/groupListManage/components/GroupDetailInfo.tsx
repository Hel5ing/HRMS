import React from 'react';
import { Modal, Card, Divider, Descriptions, Button, Spin } from 'antd';

import styles from './Center.less';

interface GroupInfoProps {
  visible: boolean;
  onCancel: () => void;
  onAddAdmin: () => void;
  deleteAdmin: (adminId: number) => void;
  detailInfo: any;
  deleteAdminLoading: boolean;
}

class GroupDetailInfo extends React.Component<GroupInfoProps> {
  render() {
    const {
      onCancel,
      onAddAdmin,
      deleteAdminLoading,
      deleteAdmin,
      visible,
      detailInfo,
    } = this.props;

    return (
      <Modal
        style={{ width: 800 }}
        visible={visible}
        okText="添加总控"
        cancelText="返回"
        onCancel={onCancel}
        onOk={onAddAdmin}
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
                <div>
                  <Descriptions
                    title="管理员信息"
                    bordered
                    column={2}
                    layout="vertical"
                    style={{ marginBottom: 10 }}
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
                  <Button
                    type="primary"
                    loading={deleteAdminLoading}
                    onClick={() => {
                      deleteAdmin(personInfo.id);
                    }}
                  >
                    删除集团总控
                  </Button>
                  <Divider dashed />
                </div>
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
