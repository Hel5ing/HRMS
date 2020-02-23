import React from 'react';
import { Modal, Card, Divider, Descriptions, Spin } from 'antd';
import styles from '../style.less';

interface PersonInfoProps {
  visible: boolean;
  onCancel: () => void;
  personInfo: any;
}

class PersonPositionView extends React.Component<PersonInfoProps> {
  render() {
    const { onCancel, visible, personInfo } = this.props;

    const onOk = () => {
      onCancel();
    };

    return (
      <Modal
        style={{ width: 800 }}
        visible={visible}
        okText="确定"
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
                <i className={styles.title} />
                {personInfo.position ? personInfo.position.name : ''}
              </p>
              <p>
                <i className={styles.group} />
                {personInfo.mobile}
              </p>
              <p>
                <i className={styles.address} />
                {personInfo.email}
              </p>
            </div>
            <Divider dashed />
            <Descriptions bordered column={2} layout="vertical" style={{ marginBottom: 32 }}>
              <Descriptions.Item label="员工工号">{personInfo.employee_id}</Descriptions.Item>
              <Descriptions.Item label="所属站点">
                {personInfo.site ? personInfo.site.name : ''}
              </Descriptions.Item>
              <Descriptions.Item label="学历">{personInfo.education}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {personInfo.status ? personInfo.status.name : ''}
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

export default PersonPositionView;
