import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Menu, Button, Layout, Input, Select, Message, Drawer, Spin, Tooltip, Divider, Avatar, Image, Dropdown } from '@arco-design/web-react';
import {
  IconMenu,
  IconLanguage,
  IconMoonFill,
  IconSunFill,
  IconSearch,
  IconApps,
  IconBug,
  IconBulb,
  IconSafe,
  IconRobot,
  IconMenuUnfold,
  IconMenuFold,
  IconDown,
  IconUser,
  IconHome,
  IconDashboard,
  IconSettings
} from '@arco-design/web-react/icon';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import styles from './style/layout.module.less';
import useLocale from '@/utils/useLocale';
import { FormInstance } from '@arco-design/web-react/es/Form';
import apiClient from '@/utils/apiService';
import { GlobalContext } from '@/context';
import defaultLocale from '@/locale';
import { clearCookie } from '@/utils/useCookies'; // 导入函数
import lazyload from '@/utils/lazyload';
import getUrlParams from '@/utils/getUrlParams';
import qs from 'query-string';
import Logo from './assets/images/AcebergAuto_logo.png';
import Logomini from './assets/images/AcebergAuto_logomini.png';
import { useSelector } from 'react-redux';
import { GlobalState } from './store';
import useRoute, { IRoute } from '@/routes';
import {getCookie} from '@/utils/useCookies';
import useStorage from './utils/useStorage';


function PageLayout() {
  const { settings, userLoading, userInfo } = useSelector(
    (state: GlobalState) => state
  );

  // 国际化
  const t = useLocale();
  // redux
  const { lang, setLang, theme, setTheme } = useContext(GlobalContext);


  const history = useHistory();

  const MenuItem = Menu.Item;



  const [routes, defaultRoute] = useRoute(userInfo?.permissions);
  function getFlattenRoutes(routes) {
    const res = [];
    function travel(_routes) {
      _routes.forEach((route) => {
        const visibleChildren = (route.children || []).filter(
          (child) => !child.ignore
        );
        if (route.key && (!route.children || !visibleChildren.length)) {
          try {
            route.component = lazyload(() => import(`./components/${route.key}`));
            res.push(route);
          } catch (e) {
            console.error(e);
          }
        }
        if (route.children && route.children.length) {
          travel(route.children);
        }
      });
    }
    travel(routes);
    return res;
  }



  const memoroutes = useMemo(() => getFlattenRoutes(routes) || [], [routes]);

  const onExit = () => {
    // 清除 token
    clearCookie("token");
    // localStorage的userStatus登陆状态改为logout
    localStorage.setItem('userStatus', 'logout');
    // 清除userInfo
    localStorage.removeItem('userInfo');

    // 跳转到登录页
    history.push({
      pathname: '/login',
    });
  }

  // 多语言
  const currentLangRef = useRef(lang);
  useEffect(() => {
    if (currentLangRef.current !== lang) {
      currentLangRef.current = lang;
      const nextLang = defaultLocale[lang];
      Message.info(`${nextLang['message.lang.tips']}${lang}`);
    }
  }, [lang])

  // menu展开关闭
  const [collapse, setcollapse] = useState(false)


  // usr的下拉
  const dropList = (
    <Menu>
      <Menu.Item
        key='0'
        style={{
          fontSize: '12px',
        }}
        disabled
      >
        <IconUser /> Aceberg老王科技有限公司
      </Menu.Item>
      <Menu.Item
        key='1'
        style={{
          fontSize: '12px',
        }}
      >
        用户设置
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item
        key='2'
        style={{
          fontSize: '12px',
        }}
        onClick={onExit}>
        退出登录
      </Menu.Item>
    </Menu>
  );


  // 点击menu
  const pathname = history.location.pathname;
  const currentComponent = pathname.split('/').pop() || 'dash';

  const [activemenu, setactivemenu] = useState(currentComponent)

  const clickmenu = (v) => {
    setactivemenu(v)
    history.push({
      pathname: `/${v}`,
    })
  }

  const changetheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    // const currenttheme = localStorage.getItem('theme')
    // changeTheme(currenttheme === 'light' ? 'dark' : 'light')
    // localStorage.setItem('theme',currenttheme=='dark'?'light':'dark')
  }

  const iconMap = {
    IconDashboard: <IconDashboard />,
    IconApps: <IconApps />,
    IconBug: <IconBug />,
    IconSetting: <IconSettings />,
    // 其他图标映射...
  };

  const getRole = useCallback(() => {
    const role = localStorage.getItem('role')
    return role
  },[])

  return (
    <Layout className={styles.layout}>
      {userLoading ? (
        <Spin className={styles['spin']} />
      ) : (
        <Layout>

          <Layout className={styles['layout-content']}>
            <div className={styles['layout-content-wrapper']}>



              <div className={styles.container}>
                <div className={styles.home_menu} style={{ width: collapse ? 48 : 180, left: 0 }}>
                  <div className={styles.home_menu_logo}>
                    <Image width={collapse ? 40 : 120} src={collapse ? Logomini : Logo} preview={false} />
                  </div>
                  <div className={styles.home_menu_menu} style={{ width: collapse ? 48 : 180, }}>
                    <Menu
                      style={{ width: '100%' }}
                      defaultSelectedKeys={[activemenu]}
                      collapse={collapse}
                    >
                      {
                        routes.map((item) => item.children ? (
                          <Menu.SubMenu key={item.key} title={
                            <>
                              {iconMap[item.icon]} {item.name}
                            </>
                          }>
                            {item.children.map((child) => {
                              const isUsersKey = child.key == 'users';
                              const isAdminRole = getRole() == 'admin'; 
                              
                              return isUsersKey ?  isAdminRole  && 
                                <Menu.Item key={child.key} onClick={() => clickmenu(child.key)}>
                                  <span>{child.name}</span>
                                </Menu.Item> : <Menu.Item key={child.key} onClick={() => clickmenu(child.key)}>
                                  <span>{child.name}</span>
                                </Menu.Item>
                          }
                            )}
                          </Menu.SubMenu>
                        ) : (
                          <Menu.Item key={item.key} onClick={() => clickmenu(item.key)}>
                            {iconMap[item.icon]}
                            <span>{item.name}</span>
                          </Menu.Item>
                        ))
                      }

                    </Menu>

                    <Button
                      style={{
                        height: 30,
                        position: 'absolute',
                        right: collapse ? 6 : 12,
                        bottom: 36,
                      }}
                      type='secondary'
                      size='mini'
                      onClick={() => setcollapse(!collapse)}
                    >
                      {collapse ? <IconMenuUnfold /> : <IconMenuFold />}
                    </Button>
                  </div>
                </div>
                <div className={styles.home_right} style={{ width: collapse ? 'calc(100% - 48px)' : 'calc(100% - 180px)' }}>
                  <div className={styles.home_nav}>
                    <Button
                      style={{ width: 28, height: 28 }}
                      icon={<IconLanguage />}
                      onClick={() => setLang(lang === 'en-US' ? 'zh-CN' : 'en-US')}
                    />
                    <Button
                      style={{ width: 28, height: 28 }}
                      icon={theme !== 'dark' ? <IconMoonFill /> : <IconSunFill />}
                      onClick={changetheme}
                    />


                    <Dropdown droplist={dropList} position='br'>
                      <div className={styles.home_nav_usr}>
                        {'王Aceberg'.slice(0, 1).toUpperCase()}
                      </div>
                    </Dropdown>

                  </div>
                  <div className={styles.home_content}>

                    <Switch>
                      {memoroutes.map((route, index) => {
                        return (
                          <Route
                          key={index}
                          path={`/${route.key}`}
                          component={route.component}
                        />
                        );
                      })}
                    <Route exact path='/'>
                      <Redirect to={'/dash'} />
                    </Route>
                    <Route
                      path="*"
                      component={lazyload(() => import('./components/exception'))}
                    />

                    </Switch>
                  </div>
                  <div className={styles.home_footer}>AcebergAuto By Aceberg</div>
                </div>
              </div>
            </div>
          </Layout>
        </Layout>
      )}
    </Layout>
  );
}

export default PageLayout;
