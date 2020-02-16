import React from 'react';
import { Table, Button, message, Icon, Upload, Form, Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { LoginInfo } from '@/models/login';
import { FormComponentProps } from 'antd/lib/form';
import styles from '../style.less';

interface StateData {
    pagination: { current: number; total: number };
    dataList: any[];
}

class ProductExamList extends React.Component<FormComponentProps> {
    columns = [
        {
            title: '员工姓名',
            dataIndex: 'engineer',
            key: 'engineerName',
            render: (data: any) => <div>{data.name}</div>
        },
        {
            title: '员工号',
            dataIndex: 'engineer',
            key: 'engineerId',
            render: (data: any) => <div>{data.employee_id}</div>
        },
        {
            title: '培训期数',
            dataIndex: 'training_term',
            key: 'training_term',
        },
        {
            title: '是否合格',
            dataIndex: 'is_passed',
            key: 'is_passed',
            render: (isPass: number) => <div>{isPass === 1 ? "合格" : "不合格"}</div>
        },
        {
            title: '产品线',
            dataIndex: 'product_line',
            key: 'product_line',
            render: (data: any) => <div>{data ? data.name : ""}</div>
        },
        {
            title: '产品类型',
            dataIndex: 'product_category',
            key: 'product_category',
            render: (data: any) => <div>{data ? data.name : ""}</div>
        },
        {
            title: '产品名称',
            dataIndex: 'product',
            key: 'product',
            render: (data: any) => <div>{data ? data.name : ""}</div>
        },
        {
            title: '考试成绩',
            dataIndex: 'score',
            key: 'score',
        }
    ];

    state: StateData = {
        pagination: { current: 1, total: 1 },
        dataList: [],
    };

    private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
        localStorage.getItem('LoginInfo') as string,
    );
    private token: string = '';

    componentDidMount() {
        this.token =
            'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
        this.getDataInfoList();
    }

    getDataInfoList = () => {
        if (!this.loginData) return;
        return fetch('/api/exam/list', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: this.token,
            },
            method: 'POST',
            body: JSON.stringify({
                type: 2,
                limit: 10,
                offset: (this.state.pagination.current - 1) * 10,
            }),
        })
            .then(response => response.json())
            .then(json => {
                (json.response.list as []).forEach((data: any, index: number) => {
                    data.key = index;
                });
                const pagination = { ...this.state.pagination };
                pagination.total = json.response.total ? json.response.total : 1;
                this.setState({
                    pagination,
                    dataList: json.response.list,
                });
            });
    };

    handleTableChange = (pagination: any) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this.getDataInfoList();
        });
    };

    render() {
        if (!this.state.dataList.length) {
            return <PageLoading />;
        }

        const getDataList = () => {
            this.getDataInfoList();
        }

        const props = {
            accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            name: 'excel',
            action: '/api/exam/import',
            headers: {
                Authorization: this.token,
            },
            data: { type: 2 },
            onChange(info: any) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功`);
                    getDataList();
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                }
            },
        };

        return (
            <PageHeaderWrapper>
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListOperator}>
                            <Upload {...props}>
                                <Button>
                                    <Icon type="upload" /> 上传
                                </Button>
                            </Upload>
                        </div>
                        <Table
                            columns={this.columns}
                            bordered
                            dataSource={this.state.dataList}
                            pagination={this.state.pagination}
                            onChange={this.handleTableChange}

                        />
                    </div>

                </Card>
            </PageHeaderWrapper>
        );
    }
}
export default Form.create<FormComponentProps>()(ProductExamList);
