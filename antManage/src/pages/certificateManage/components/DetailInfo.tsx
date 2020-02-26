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

    const creatPerson: any = detailInfo ? detailInfo.course_authority.engineer : null;
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
              <div className={styles.name}>证书详情</div>
            </div>

            <Descriptions column={2}>
              <Descriptions.Item label="证书编号">{detailInfo.serial}</Descriptions.Item>
              <Descriptions.Item label="授权主课程">{detailInfo.course_authority.course.title}</Descriptions.Item>
              <Descriptions.Item label="证书有效期">{detailInfo.expiry_date}</Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            <div>
              <Descriptions
                title="员工信息"
                bordered
                column={2}
                layout="vertical"
                style={{ marginBottom: 10 }}
              >
                <Descriptions.Item label="姓名">
                  {creatPerson ? creatPerson.name : ''}
                </Descriptions.Item>
                <Descriptions.Item label="员工工号">
                  {creatPerson ? creatPerson.employee_id : ''}
                </Descriptions.Item>
              </Descriptions>
              <Divider dashed />      
            </div>
          </Card>
        ) : (
            <Spin />
          )}
      </Modal>
    );
  }
}

export default DetailInfo;
