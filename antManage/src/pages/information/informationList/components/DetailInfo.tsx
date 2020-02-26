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

    const creatPerson: any = detailInfo ? detailInfo.created_by : null;
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
              <div className={styles.name}>{detailInfo.title}</div>
            </div>

            <Descriptions column={2}>
              <Descriptions.Item label="信息类别名字">{detailInfo.category.name}</Descriptions.Item>
              <Descriptions.Item label="信息状态">{detailInfo.status.name}</Descriptions.Item>
              <Descriptions.Item label="信息内容">{detailInfo.content}</Descriptions.Item>
              <Descriptions.Item label="覆盖角色">{detailInfo.roles}</Descriptions.Item>
              <Descriptions.Item label="生效日期">{detailInfo.efected_at}</Descriptions.Item>
              <Descriptions.Item label="紧急级别">{detailInfo.priority ? (detailInfo.priority == 1 ? '低' : (detailInfo.priority == 2 ? '中' : '高')) : ''}</Descriptions.Item>
            </Descriptions>
            <Divider dashed />
            <div>
              <Descriptions
                title="信息创建者"
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
