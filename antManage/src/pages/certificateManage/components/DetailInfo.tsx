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
              <div className={styles.name}>权限暂停</div>
            </div>

            <Descriptions column={2}>
              <Descriptions.Item label="授权主课程">{detailInfo.course_authority.course.title}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailInfo.created_at}</Descriptions.Item>
              <Descriptions.Item label="课程内容">{detailInfo.course_authority.course.content}</Descriptions.Item>
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
                <Descriptions.Item label="联系方式">
                  {creatPerson ? creatPerson.mobile : ''}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {creatPerson ? creatPerson.email : ''}
                </Descriptions.Item>
              </Descriptions>
              <Divider dashed />

              <Divider dashed />
              <Descriptions
                title="站点信息"
                bordered
                column={2}
                layout="vertical"
                style={{ marginBottom: 32 }}
              >
                <Descriptions.Item label="站点名称">
                  {creatPerson.site ? creatPerson.site.name : ''}
                </Descriptions.Item>
                <Descriptions.Item label="站点渠道">
                  {creatPerson.site ? creatPerson.site.channel : ''}
                </Descriptions.Item>
                <Descriptions.Item label="站点省份">
                  {creatPerson.site
                    ? creatPerson.site.province + creatPerson.site.city + creatPerson.site.district
                    : ''}
                </Descriptions.Item>
                <Descriptions.Item label="详细地址">
                  {creatPerson.site ? creatPerson.site.address : ''}
                </Descriptions.Item>
              </Descriptions>
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
