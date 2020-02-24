import { IConfig, IPlugin } from 'umi-types';
import defaultSettings from './defaultSettings'; // https://umijs.org/config/

import slash from 'slash2';
import webpackPlugin from './plugin.config';
const { pwa, primaryColor } = defaultSettings; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;
const isAntDesignProPreview = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site';
const plugins: IPlugin[] = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        // default false
        enable: true,
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: true,
      },
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      //   webpackChunkName: true,
      //   level: 3,
      // },
      pwa: pwa
        ? {
            workboxPluginMode: 'InjectManifest',
            workboxOptions: {
              importWorkboxFrom: 'local',
            },
          }
        : false, // default close dll, because issue https://github.com/ant-design/ant-design-pro/issues/4665
      // dll features https://webpack.js.org/plugins/dll-plugin/
      // dll: {
      //   include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
      //   exclude: ['@babel/runtime', 'netlify-lambda'],
      // },
    },
  ],
  [
    'umi-plugin-pro-block',
    {
      moveMock: false,
      moveService: false,
      modifyRequest: true,
      autoAddMenu: true,
    },
  ],
]; // 针对 preview.pro.ant.design 的 GA 统计代码

if (isAntDesignProPreview) {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

export default {
  history: 'hash',
  //采用hash路由：#/xxx的形式
  plugins,
  block: {
    // 国内用户可以使用码云
    // defaultGitUrl: 'https://gitee.com/ant-design/pro-blocks',
    defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
  },
  hash: true,
  targets: {
    ie: 11,
  },
  devtool: isAntDesignProPreview ? 'source-map' : false,
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          routes: [
            {
              path: '/',
              redirect: '/welcome',
            },
            {
              path: '/welcome',
              name: 'welcome',
              icon: 'smile',
              component: './Welcome',
            },
            {
              path: '/groupManage',
              name: 'groupManage',
              icon: 'smile',
              routes: [
                {
                  path: '/groupManage',
                  redirect: '/groupManage/groupInfo',
                },
                {
                  path: '/groupManage/groupInfo',
                  name: 'groupInfo',
                  icon: 'crown',
                  component: './groupManage/groupInfo/GroupInfoView',
                },
                {
                  path: '/groupManage/siteInfoList',
                  name: 'siteInfoList',
                  icon: 'crown',
                  component: './groupManage/siteInfoList/SiteInfoList',
                },
                {
                  path: '/groupManage/personInfoList',
                  name: 'personInfoList',
                  icon: 'crown',
                  component: './groupManage/personInfoList/PersonInfoList',
                },
                {
                  path: '/groupManage/positionStructure',
                  name: 'positionStructure',
                  icon: 'crown',
                  component: './groupManage/positionStructure/PositionStructure',
                },
              ],
            },
            {
              path: '/secondStage',
              name: 'secondStage',
              icon: 'smile',
              routes: [
                {
                  path: '/secondStage',
                  redirect: '/secondStage/groupListManage',
                },
                {
                  path: '/secondStage/groupListManage',
                  name: 'groupListManage',
                  icon: 'crown',
                  component: './secondStage/groupListManage/GroupList',
                },
                {
                  path: '/secondStage/siteListManage',
                  name: 'siteListManage',
                  icon: 'crown',
                  component: './secondStage/siteListManage/siteListManage',
                },
                {
                  path: '/secondStage/roleManage',
                  name: 'roleManage',
                  icon: 'crown',
                  component: './secondStage/roleManage/RoleInfoList',
                },
                {
                  path: '/secondStage/userInfoManage',
                  name: 'userInfoManage',
                  icon: 'crown',
                  component: './secondStage/userInfoManage/UserInfoManage',
                },
                {
                  path: '/secondStage/positionManage',
                  name: 'positionManage',
                  icon: 'crown',
                  component: './secondStage/positionManage/PositionManage',
                },
              ],
            },
            {
              path: '/productManage',
              name: 'productManage',
              icon: 'smile',
              routes: [
                {
                  path: '/productManage',
                  redirect: '/productManage/productList',
                },
                {
                  path: '/productManage/productList',
                  name: 'productList',
                  icon: 'crown',
                  component: './productManage/productList/ProductList',
                },
                {
                  path: '/productManage/productType',
                  name: 'productType',
                  icon: 'crown',
                  component: './productManage/productType/ProductTypeView',
                },
                {
                  path: '/productManage/productLine',
                  name: 'productLine',
                  icon: 'crown',
                  component: './productManage/productLine/ProductLine',
                },
              ],
            },
            {
              path: '/information',
              name: 'information',
              icon: 'smile',
              routes: [
                {
                  path: '/information',
                  redirect: '/information/informationType',
                },
                {
                  path: '/information/informationType',
                  name: 'informationType',
                  icon: 'crown',
                  component: './information/informationType/InformationType',
                },
                {
                  path: '/information/informationList',
                  name: 'informationList',
                  icon: 'crown',
                  component: './information/informationList/InformationList',
                },
              ],
            },
            {
              path: '/rewardManage',
              name: 'rewardManage',
              icon: 'smile',
              routes: [
                {
                  path: '/rewardManage',
                  redirect: '/rewardManage/rewardType',
                },
                {
                  path: '/rewardManage/rewardType',
                  name: 'rewardType',
                  icon: 'crown',
                  component: './rewardManage/rewardType',
                },
                {
                  path: '/rewardManage/rewardList',
                  name: 'rewardList',
                  icon: 'crown',
                  component: './rewardManage/rewardList',
                },
              ],
            },
            {
              path: '/courseManage',
              name: 'courseManage',
              icon: 'smile',
              routes: [
                {
                  path: '/courseManage',
                  redirect: '/courseManage/courseType',
                },
                {
                  path: '/courseManage/courseType',
                  name: 'courseType',
                  icon: 'crown',
                  component: './courseManage/courseType',
                },
                {
                  path: '/courseManage/courseList',
                  name: 'courseList',
                  icon: 'crown',
                  component: './courseManage/courseList',
                },
              ],
            },
            {
              path: '/examManage',
              name: 'examManage',
              icon: 'smile',
              routes: [
                {
                  path: '/examManage',
                  redirect: '/examManage/courseExamList',
                },
                {
                  path: '/examManage/courseExamList',
                  name: 'courseExamList',
                  icon: 'crown',
                  component: './examManage/courseExamList',
                },
                {
                  path: '/examManage/productExamList',
                  name: 'productExamList',
                  icon: 'crown',
                  component: './examManage/productExamList',
                },
              ],
            },
            {
              path: '/suspendManage',
              name: 'suspendManage',
              icon: 'smile',
              routes: [
                {
                  path: '/suspendManage',
                  redirect: '/suspendManage/courseSuspendList',
                },
                {
                  path: '/suspendManage/courseSuspendList',
                  name: 'courseSuspendList',
                  icon: 'crown',
                  component: './suspendManage/courseSuspendList',
                },
                {
                  path: '/suspendManage/productSuspendList',
                  name: 'productSuspendList',
                  icon: 'crown',
                  component: './suspendManage/productSuspendList',
                },
              ],
            },
            {
              path: '/certificateManage',
              name: 'certificateManage',
              icon: 'smile',
              component: './certificateManage',
            },
            {
              path: '/auditManage',
              name: 'auditManage',
              icon: 'smile',
              routes: [
                {
                  path: '/auditManage',
                  redirect: '/auditManage/onboardAuditList',
                },
                {
                  path: '/auditManage/onboardAuditList',
                  name: 'onboardAuditList',
                  component: './auditManage/onboardAuditList',
                },
                {
                  path: '/auditManage/offboardAuditList',
                  name: 'offboardAuditList',
                  component: './auditManage/offboardAuditList',
                },
                {
                  path: '/auditManage/positionChangeAuditList',
                  name: 'positionChangeAuditList',
                  component: './auditManage/positionChangeAuditList',
                },
                {
                  path: '/auditManage/reCertificateAuditList',
                  name: 'reCertificateAuditList',
                  component: './auditManage/reCertificateAuditList',
                },
              ],
            },
            {
              path: '/setting',
              name: 'setting',
              icon: 'smile',
              component: './setting',
            },
          ],
        },
      ],
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  define: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context: {
        resourcePath: string;
      },
      _: string,
      localName: string,
    ) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }

      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },
  chainWebpack: webpackPlugin,
  proxy: {
    '/api': {
      target: 'http://debug.hpicss.com:8111/api',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    },
  },
} as IConfig;
