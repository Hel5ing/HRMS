import React, { Component } from 'react';
import { Select } from 'antd';

import styles from './GeographicView.less';
import { LoginInfo } from '@/models/login';

const { Option } = Select;

interface SelectItem {
  label: string;
  key: string;
}
const nullSelectItem: SelectItem = {
  label: '',
  key: '',
};

interface GeographicViewProps {
  // productLineList?: any[];
  productTypeList?: any[];
  productList?: any[];
  selectValue: {
    productLine: SelectItem;
    productType: SelectItem;
    product: string[];
  };
  onChange: (value: { productLine: any; productType: any; product: string[] }) => void;
}

interface StateData {
  productLineList?: any[];
  productTypeList?: any[];
  productList?: any[];
}

class ProductSelectView extends Component<GeographicViewProps> {
  state: StateData = {};

  private loginData: { passWord: string; loginInfo: LoginInfo } = JSON.parse(
    localStorage.getItem('LoginInfo') as string,
  );
  private token: string = '';

  componentDidMount() {
    this.token =
      'Basic ' + btoa(this.loginData.loginInfo.person.mobile + ':' + this.loginData.passWord);
    this.getProductLineList();
  }

  getProductLineList = () => {
    if (!this.loginData) return;
    return fetch('/api/product/line/list', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        limit: 999,
        offset: 0,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.name;
            item.key = data.id;

            list.push(item);
          });
          this.setState({
            productLineList: list,
            productTypeList: [],
            productList: [],
          });
        } else {
        }
      });
  };

  getProductTypeList = (id: string) => {
    if (!this.loginData) return;
    return fetch('/api/product/category/list/byline', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        product_line_id: id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.product_category.name;
            item.key = data.product_category.id;

            list.push(item);
          });
          this.setState({
            productTypeList: list,
            productList: [],
          });
        }
      });
  };

  getProductList = (id: string) => {
    if (!this.loginData) return;
    return fetch('/api/product/list/bycategory', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.token,
      },
      method: 'POST',
      body: JSON.stringify({
        product_line_id: this.props.selectValue?.productLine.key,
        product_category_id: id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          let list: any[] = [];
          (json.response as []).forEach((data: any) => {
            let item: any = {};
            item.value = data.name;
            item.key = data.id;

            list.push(item);
          });
          this.setState({
            productList: list,
          });
        }
      });
  };

  selectProductLineItem = (item: SelectItem) => {
    // this.setState({
    //     productLine: item
    // });
    const { onChange } = this.props;
    if (onChange) {
      onChange({
        productLine: item,
        productType: nullSelectItem,
        product: [],
      });
    }

    this.getProductTypeList(item.key);
  };

  selectProductTypeItem = (item: SelectItem) => {
    // this.setState({
    //     productType: item
    // });
    const { onChange, selectValue } = this.props;
    if (onChange) {
      onChange({
        productLine: selectValue?.productLine,
        productType: item,
        product: [],
      });
    }

    this.getProductList(item.key);
  };

  selectProductItem = (data: string[]) => {
    // this.setState({
    //     product: data
    // })
    const { onChange, selectValue } = this.props;
    if (onChange) {
      onChange({
        productLine: selectValue?.productLine,
        productType: selectValue?.productType,
        product: data,
      });
    }
  };

  render() {
    const { selectValue } = this.props;
    return (
      <div>
        <Select
          style={{ width: 200 }}
          className={styles.item}
          value={selectValue?.productLine}
          labelInValue
          showSearch
          onSelect={this.selectProductLineItem}
        >
          {this.state.productLineList?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          })}
        </Select>
        <Select
          style={{ marginLeft: 20, width: 200 }}
          className={styles.item}
          value={selectValue?.productType}
          labelInValue
          showSearch
          onSelect={this.selectProductTypeItem}
        >
          {this.props.productTypeList ? this.props.productTypeList?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          }) : this.state.productTypeList?.map(data => {
            return <Option key={data.key}>{data.value}</Option>;
          })}
        </Select>
        <Select
          style={{ marginTop: 10, width: 300 }}
          className={styles.item}
          value={selectValue?.product}
          mode="multiple"
          onChange={this.selectProductItem}
        >
          {this.props.productList ? this.props.productList?.map(data => {
            return <Option key={data.key} value={data.key}>{data.value}</Option>;
          }) :this.state.productList?.map(data => {
            return <Option key={data.key} value={data.key}>{data.value}</Option>;
          })}
        </Select>
        ,
      </div>
    );
  }
}

export default ProductSelectView;
