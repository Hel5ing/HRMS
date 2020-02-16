import React, { Component } from 'react';
import { Select } from 'antd';

import styles from './GeographicView.less';
import { GeographicData } from '../../geographic/Geographic';

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
  cityList?: string[];
  districtList?: string[];
  value?: {
    province: string;
    city: string;
    district: string;
  };
  onChange?: (value: { province: string; city: string; district: string }) => void;
}

class GeographicView extends Component<GeographicViewProps> {
  getCityOption = () => {
    const { cityList } = this.props;
    if (cityList && cityList.length > 0) {
      return this.getOption(cityList);
    }
    return [];
  };

  getDistrictOption = () => {
    const { districtList } = this.props;
    if (districtList && districtList.length > 0) {
      return this.getOption(districtList);
    }
    return [];
  };

  getProvinceOption = () => {
    let provinceList: string[] = [];
    GeographicData.forEach(data => {
      provinceList.push(data.name);
    });
    if (provinceList.length > 0) {
      return this.getOption(provinceList);
    }

    return [];
  };

  getOption = (list: string[]) => {
    if (!list || list.length < 1) {
      return (
        <Option key={0} value={0}>
          没有找到选项
        </Option>
      );
    }
    return list.map((item, index) => (
      <Option key={index} value={item}>
        {item}
      </Option>
    ));
  };

  selectProvinceItem = (item: SelectItem) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange({
        province: item.label,
        city: '',
        district: '',
      });
    }
  };

  selectCityItem = (item: SelectItem) => {
    const { value, onChange } = this.props;
    if (value && onChange) {
      onChange({
        province: value.province,
        city: item.label,
        district: '',
      });
    }
  };

  selectDistrictItem = (item: SelectItem) => {
    const { value, onChange } = this.props;
    if (value && onChange) {
      onChange({
        province: value.province,
        city: value.city,
        district: item.label,
      });
    }
  };

  conversionObject() {
    const { value } = this.props;
    if (!value) {
      return {
        province: nullSelectItem,
        city: nullSelectItem,
        district: nullSelectItem,
      };
    }
    const { province, city, district } = value;
    return {
      province: { key: province, label: province } || nullSelectItem,
      city: { key: city, label: city } || nullSelectItem,
      district: { key: district, label: district } || nullSelectItem,
    };
  }

  render() {
    const { province, city, district } = this.conversionObject();

    return (
      <div>
        <Select
          style={{ width: 80 }}
          className={styles.item}
          value={province}
          labelInValue
          showSearch
          onSelect={this.selectProvinceItem}
        >
          {this.getProvinceOption()}
        </Select>
        <Select
          style={{ marginLeft: 10, width: 80 }}
          className={styles.item}
          value={city}
          labelInValue
          showSearch
          onSelect={this.selectCityItem}
        >
          {this.getCityOption()}
        </Select>

        <Select
          style={{ marginLeft: 10, width: 80 }}
          className={styles.item}
          value={district}
          labelInValue
          showSearch
          onSelect={this.selectDistrictItem}
        >
          {this.getDistrictOption()}
        </Select>
      </div>
    );
  }
}

export default GeographicView;
