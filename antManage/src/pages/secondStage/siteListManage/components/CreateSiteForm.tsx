import { Form, Input, Modal, Select } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React from 'react';
import GeographicView from './GeographicView';
import { SiteInfo } from '@/pages/groupManage/siteInfoList/SiteInfoList';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

interface CreateFormProps extends FormComponentProps {
  formVisible: boolean;
  handleAdd: (fieldsValue: { desc: string }) => void;
  handleEdit: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
  cityList?: string[];
  districtList?: string[];
  selectValue?: {
    province: string;
    city: string;
    district: string;
  };
  onChange?: (value: { province: string; city: string; district: string }) => void;
  statusList?: any[];
  siteList?: any[];
  editData?: SiteInfo;
}

const CreateSiteForm: React.FC<CreateFormProps> = props => {
  const {
    formVisible,
    statusList,
    form,
    handleAdd,
    handleEdit,
    selectValue,
    onChange,
    cityList,
    districtList,
    onCancel,
    editData,
    siteList,
  } = props;

  const onCreate = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      console.log('---validateFields: ', fieldsValue);
      if (editData) {
        fieldsValue.site_id = editData.id;
        handleEdit(fieldsValue);
      } else {
        handleAdd(fieldsValue);
      }
    });
  };

  const validatorForm = (
    _: any,
    value: {
      province: string;
      city: string;
      district: string;
    },
    callback: (message?: string) => void,
  ) => {
    const { province, city, district } = value;
    if (!province) {
      callback('请选择省份!');
    }
    if (!city) {
      callback('请选择城市!');
    }
    if (!district) {
      callback('请选择城区!');
    }

    callback();
  };

  const { getFieldDecorator } = form;

  return (
    <Modal visible={formVisible} title="添加站点" okText="确定" onCancel={onCancel} onOk={onCreate}>
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} layout="vertical">
        <FormItem style={{ marginBottom: 0 }} label="站点名称">
          {getFieldDecorator('site_name', {
            initialValue: editData ? editData.name : '',
            rules: [
              {
                required: true,
                message: '请输入站点名称!',
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="站点总控编号">
          {getFieldDecorator('site_admin_id', {
            initialValue: editData && editData.admin.length > 0 ? editData.admin[0].id : '',
          })(<Input />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="站点类型">
          {getFieldDecorator('type', {
            initialValue: editData ? editData.type.id : '',
            rules: [
              {
                required: true,
                message: '请选择站点类型!',
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

        <FormItem style={{ marginBottom: 15 }} label="站点状态">
          {getFieldDecorator('status', {
            initialValue: editData ? editData.status.id : '',
            rules: [
              {
                required: true,
                message: '请选择站点状态!',
              },
            ],
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

        <FormItem style={{ marginBottom: 15 }} label="所在省市区">
          {getFieldDecorator('geographic', {
            initialValue: selectValue,
            rules: [
              {
                required: true,
                message: '请输入您的所在省市!',
              },
              {
                validator: validatorForm,
              },
            ],
          })(
            <GeographicView cityList={cityList} districtList={districtList} onChange={onChange} />,
          )}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="详细地址">
          {getFieldDecorator('address', {
            initialValue: editData ? editData.address : '',
            rules: [
              {
                required: true,
                message: '请输入详细地址!',
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="站点代码">
          {getFieldDecorator('code', {
            initialValue: editData ? editData.code : '',
            rules: [
              {
                required: true,
                message: '请输入站点代码!',
              },
            ],
          })(<Input disabled={editData ? true : false} />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="站点星级">
          {getFieldDecorator('star', {
            initialValue: editData ? editData.star : '',
          })(<Input />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="站点渠道">
          {getFieldDecorator('channel', {
            initialValue: editData ? editData.channel : '',
            rules: [
              {
                required: true,
                message: '请输入站点渠道!',
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem style={{ marginBottom: 15 }} label="城市级别">
          {getFieldDecorator('region', {
            initialValue: editData ? editData.region : '',
            rules: [
              {
                required: true,
                message: '请输入城市级别!',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="GCSS ID">
          {getFieldDecorator('gcss_id', {
            initialValue: editData ? editData.gcss_id : '',
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="ESS II NO.">
          {getFieldDecorator('ess_ii_no', {
            initialValue: editData ? editData.ess_ii_no : '',
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="WEBAAS ID(CPC)">
          {getFieldDecorator('cpc_id', {
            initialValue: editData ? editData.cpc_id : '',
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="WEBAAS ID(CIP)">
          {getFieldDecorator('cip_id', {
            initialValue: editData ? editData.cip_id : '',
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="Einstein ID">
          {getFieldDecorator('einstein_id', {
            initialValue: editData ? editData.einstein_id : '',
          })(<Input />)}
        </FormItem>
        <FormItem style={{ marginBottom: 15 }} label="Queue">
          {getFieldDecorator('queue', {
            initialValue: editData ? editData.queue : '',
          })(<Input />)}
        </FormItem>
        <Form.Item label="备注">
          {getFieldDecorator('remark', {
            initialValue: editData ? editData.remark : '',
          })(<TextArea rows={3} />)}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateSiteForm);
