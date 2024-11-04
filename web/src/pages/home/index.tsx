import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Menu, Button, Form, Input, Select, Message, Drawer, Spin, Tooltip, Divider, Avatar, Image, Dropdown } from '@arco-design/web-react';
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
  IconUser
} from '@arco-design/web-react/icon';
import {Switch, Route, Redirect, useHistory} from 'react-router-dom';
import styles from './style/index.module.less';
import useLocale from '@/utils/useLocale';
import { FormInstance } from '@arco-design/web-react/es/Form';
import apiClient from '@/utils/apiService';
import { GlobalContext } from '@/context';
import defaultLocale from '@/locale';
import { clearCookie } from '@/utils/useCookies'; // 导入函数
import lazyload from '@/utils/lazyload';
import getUrlParams from '@/utils/getUrlParams';
import qs from 'query-string';
import Logo from '../../assets/images/logo.png';
import Logomini from '../../assets/images/logomini.png';

function Home() {
  const TextArea = Input.TextArea;
  // 国际化
  const t = useLocale();
  // redux
  const { lang, setLang, theme, setTheme } = useContext(GlobalContext);


  const history = useHistory();

  const MenuItem = Menu.Item;

  const routesdata = [
    {
      name: 'Dash',
      key: 'dash',
      component: 'dash'
    },
    {
      name: 'Agent',
      key: 'agent',
      component: 'Agent'
    },
    {
      name: 'Known',
      key: 'known',
      component: 'Known'
    },
    {
      name: 'Tools',
      key: 'tools',
      component: 'Tools'
    }
  ]


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
  },[lang])

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
        <IconUser/> Aceberg老王科技有限公司
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
  
  const clickmenu=(v)=>{
    setactivemenu(v)
    if(v=='dash'){
      history.push({
        pathname: '/home/dash',
      })
    }
    else if(v=='agent'){
      history.push({
        pathname: '/home/agent',
      })
    }
    else if(v=='known'){
      history.push({
        pathname: '/home/known',
      })
    }
    else if(v=='tools'){
      history.push({
        pathname: '/home/tools',
      })
    }
  }

  const changetheme=()=>{
    setTheme(theme==='dark'?'light':'dark')

    // const currenttheme = localStorage.getItem('theme')
    // changeTheme(currenttheme === 'light' ? 'dark' : 'light')
    // localStorage.setItem('theme',currenttheme=='dark'?'light':'dark')
  }

  return (
    <div className={styles.container}>
      <div className={styles.home_menu} style={{width: collapse? 48 : 180,left: 0}}>
        <div className={styles.home_menu_logo}>
          <Image width={collapse?40:120} src={collapse?Logomini:Logo} preview={false} />
        </div>
        <div className={styles.home_menu_menu} style={{width: collapse? 48 : 180,}}>
          <Menu
            style={{ width: '100%'}}
            defaultSelectedKeys={[activemenu]}
            collapse={collapse}
          >
            <MenuItem
              key='dash'
              onClick={()=>clickmenu("dash")}
            >
              <IconApps />
              {t['dash']}
            </MenuItem>
            <MenuItem
              key='agent'
              onClick={()=>clickmenu("agent")}
            >
              <IconRobot />
              {t['agent']}
            </MenuItem>
            <MenuItem
              key='known'
              onClick={()=>clickmenu("known")}
            >
              <IconBulb />
              {t['known']}
            </MenuItem>
            <MenuItem
              key='tools'
              onClick={()=>clickmenu("tools")}
            >
              <IconSafe />
              {t['tools']}
            </MenuItem>
          </Menu>

          <Button
            style={{
              height: 30,
              position: 'absolute',
              right: collapse?6:12,
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
      <div className={styles.home_right} style={{width:collapse? 'calc(100% - 48px)' : 'calc(100% - 180px)'}}>
        <div className={styles.home_nav}>
          <Button
            style={{width: 28, height: 28}}
            icon={<IconLanguage />}
            onClick={()=>setLang(lang === 'en-US' ? 'zh-CN' : 'en-US')}
          />
          <Button
            style={{width: 28, height: 28}}
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
            {routesdata.map((route, index) => {
              return (
                <Route
                  key={index}
                  path={`/home/${route.key}`}
                  component={route.component}
              />
              );
            })}
            <Route exact path='/'>
              <Redirect to={'/home/dash'} />
            </Route>
            <Route
              path="*"
              component={lazyload(() => import('@/components/exception'))}
            />
           
          </Switch>
        </div>
        <div className={styles.home_footer}>AcebergAgent By Aceberg</div>
      </div>
      
    </div>
  );
}

export default Home;
