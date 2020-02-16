import React from 'react';
import { Form, DatePicker, Input, Card, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { LoginInfo } from '@/models/login';

const { RangePicker } = DatePicker;

class SettingHoliday extends React.Component<FormComponentProps> {
  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(localStorage.getItem(
    'LoginInfo',
  ) as string);
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
  }

  createHoliday = (values: any) => {
    if (!this.loginData) return;
    return fetch('/api/system/holiday/create', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify(values),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          message.success(json.response.name + ' 假期创建成功！');
          this.props.form.resetFields();
        } else {
          message.error('假期创建失败！');
        }
      });
  };

  handleSubmit = (e: any) => {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      // Should format date value before submit.

      const rangeValue = fieldsValue['range-picker'];
      const values = {
        name: fieldsValue.name,
        start: rangeValue[0].format('YYYY-MM-DD'),
        end: rangeValue[1].format('YYYY-MM-DD'),
      };

      this.createHoliday(values);
      console.log('Received values of form: ', values, rangeValue);
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '请选择起止时间!' }],
    };
    return (
      <Card bordered={false}>
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="节假日名称">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入节假日名称！' }],
            })(<Input style={{ width: 300 }} />)}
          </Form.Item>
          <Form.Item label="假日起止时间">
            {getFieldDecorator('range-picker', rangeConfig)(<RangePicker />)}
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: 16, offset: 8 },
            }}
          >
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default Form.create<FormComponentProps>()(SettingHoliday);
