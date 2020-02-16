import { Form, Input, Modal, Upload, Button, Select } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React, { Fragment } from 'react';
import styles from './BaseView.less';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { PersonInfo } from '../PersonInfoList';

const FormItem = Form.Item;
const { Option } = Select;

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatar }: { avatar: string }) => (
  <Fragment>
    <div className={styles.avatar_title}>
      <FormattedMessage id="groupmanageandsettings.basic.avatar" defaultMessage="Avatar" />
    </div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    {/* <Upload fileList={[]}>
      <div className={styles.button_view}>
        <Button icon="upload">
          <FormattedMessage
            id="groupmanageandsettings.basic.change-avatar"
            defaultMessage="Change avatar"
          />
        </Button>
      </div>
    </Upload> */}
  </Fragment>
);

interface CreateFormProps extends FormComponentProps {
  personFormVisible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  handleEdit: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  positionList?: { id: number; name: string; level: number }[];
  roleList?: { id: number; name: string }[];
  statusList?: any[];
  editData?: PersonInfo;
  siteList?: any[];
}

const CreatePersonForm: React.FC<CreateFormProps> = props => {
  const {
    personFormVisible,
    positionList,
    statusList,
    roleList,
    form,
    handleAdd,
    handleEdit,
    onCancel,
    editData,
    siteList,
  } = props;

  const { getFieldDecorator } = form;

  const onCreate = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if (editData) {
        fieldsValue.person_id = editData.id;
        handleEdit(fieldsValue);
      } else {
        handleAdd(fieldsValue);
      }
    });
  };

  const getAvatarURL = () => {
    const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
    return url;
  };

  return (
    <Modal visible={personFormVisible} okText="确定" onCancel={onCancel} onOk={onCreate}>
      <div className={styles.baseView}>
        <div className={styles.left}>
          <Form layout="vertical">
            <FormItem style={{ marginBottom: 0 }} label="名字">
              {getFieldDecorator('person_name', {
                initialValue: editData ? editData.name : '',
                rules: [
                  {
                    required: true,
                    message: '请输入您的名字!',
                  },
                ],
              })(<Input />)}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="联系电话">
              {getFieldDecorator('mobile', {
                initialValue: editData ? editData.mobile : '',
                rules: [
                  {
                    required: true,
                    message: '请输入您的联系电话!',
                  },
                ],
              })(<Input />)}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="邮箱">
              {getFieldDecorator('email', {
                initialValue: editData ? editData.email : '',
                rules: [
                  {
                    required: true,
                    message: '请输入您的邮箱!',
                  },
                ],
              })(<Input />)}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="身份证号">
              {getFieldDecorator('identification', {
                initialValue: editData ? editData.identification : '',
              })(<Input />)}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="学历">
              {getFieldDecorator('education', { initialValue: editData ? editData.education : '' })(
                <Input />,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="站点编号">
              {getFieldDecorator('site_id', {
                initialValue: editData ? editData.site_id : '',
                rules: [
                  {
                    required: true,
                    message: '请输入您的站点编号!',
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {siteList
                    ? siteList.map((data: { id: number; name: string }) => {
                        return (
                          <Option key={data.id} value={data.id}>
                            {data.name}
                          </Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="职位">
              {getFieldDecorator('position', {
                initialValue: editData ? editData.position : '',
                rules: [
                  {
                    required: true,
                    message: '请输选择职位!',
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {positionList
                    ? positionList.map((data: { id: number; name: string; level: number }) => {
                        return (
                          <Option key={data.id} value={data.id}>
                            {data.name}
                          </Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="角色">
              {getFieldDecorator('role', {
                initialValue: editData ? editData.role : '',
                rules: [
                  {
                    required: true,
                    message: '请输选择角色!',
                  },
                ],
              })(
                <Select style={{ width: 150 }}>
                  {roleList
                    ? roleList.map((data: { id: number; name: string }) => {
                        return (
                          <Option key={data.id} value={data.id}>
                            {data.name}
                          </Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="人员级别">
              {getFieldDecorator('level', { initialValue: editData ? editData.level : '' })(
                <Select style={{ width: 150 }}>
                  <Option key={1} value={1}>
                    初级
                  </Option>
                  <Option key={2} value={2}>
                    中级
                  </Option>
                  <Option key={3} value={3}>
                    高级
                  </Option>
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="人员星级">
              {getFieldDecorator('star', { initialValue: editData ? editData.star : '' })(
                <Select style={{ width: 150 }}>
                  <Option key={1} value={1}>
                    1
                  </Option>
                  <Option key={2} value={2}>
                    2
                  </Option>
                  <Option key={3} value={3}>
                    3
                  </Option>
                  <Option key={4} value={4}>
                    4
                  </Option>
                  <Option key={5} value={5}>
                    5
                  </Option>
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="毕业院校">
              {getFieldDecorator('college', { initialValue: editData ? editData.college : '' })(
                <Input />,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="工作年限">
              {getFieldDecorator('working', { initialValue: editData ? editData.working : '' })(
                <Input />,
              )}
            </FormItem>

            <FormItem style={{ marginBottom: 0 }} label="状态">
              {getFieldDecorator('status', {
                initialValue: editData && editData.status ? editData.status.id : '',
              })(
                <Select style={{ width: 150 }}>
                  {statusList && statusList.length
                    ? statusList.map((data: any) => {
                        return (
                          <Option key={data.id} value={data.id}>
                            {data.name}
                          </Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </FormItem>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={getAvatarURL()} />
        </div>
      </div>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreatePersonForm);
