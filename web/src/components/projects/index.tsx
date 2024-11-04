import React, { useEffect, useState, useRef, useMemo, useCallback, } from 'react';
import { InputTag, Select, Button, Form, Input, Modal, Dropdown, Menu, Divider, Message } from '@arco-design/web-react';
import { useLocation, useHistory } from 'react-router-dom';
import useLocale from '@/utils/useLocale';
import styles from './style/index.module.less';
import {
  IconCheck,
  IconClose,
  IconDelete,
  IconEdit,
  IconMore,
  IconSend,
  IconUser,
} from '@arco-design/web-react/icon';
import apiClient from '@/utils/apiService';
import { v4 as uuidv4 } from 'uuid';

const Projects = () => {
  const t = useLocale();
  // 定义form
  const FormItem = Form.Item;
  const [form] = Form.useForm();
  const Option = Select.Option;
  const Textarea = Input.TextArea;

  const location = useLocation();
  const { state } = location;


  const history = useHistory();


  // 查询接口方法
  const [data, setdata] = useState([])
  // 获取数据方法
  const projects_query = (type = '') => {
    apiClient.post('/api/projects_query',
      { type: type }
    ).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        setdata(data)

      }
      else {
        Message.error(msg);
      }

    }).catch((err) => {
      Message.error('Query Error!')
    })
  }
  useEffect(() => {
    projects_query()
    return () => {
      setdata([]); // 清理状态以防止内存泄漏
    };
  }, [])

  const [gettype, setgettype] = useState('全部');
  const datatype = ['全部', '工具', '效率', '生活', '娱乐', '影音', '艺术', '科学', '其他'];
  const filtertype = (item) => {
    setgettype(item)
    projects_query(item)
  }



  const dropList = (item: any) => (
    <Menu
      style={{
        width: 80,
        textAlign: 'center',
      }}
    >
      <Menu.Item
        key='0'
        style={{
          fontSize: '12px',
        }}
        onClick={() => {
          updateprojectsmodal(item)
        }}
      >
        <IconEdit /> 编辑
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item
        key='1'
        style={{
          fontSize: '12px',
        }}
        onClick={() => {
          delprojects(item)
        }}
      >
        <IconDelete /> 删除
      </Menu.Item>
      <Menu.Item
        key='2'
        style={{
          fontSize: '12px',
        }}
        onClick={() => {
          if (item.ison == '1') {
            Message.info('Go!')
            // 在新页面打开 /projectsstudio 没有_blank
            // history.push('/projectsstudio', {
            //   id: item.id,
            // }
            // )
            window.open(`/projectsstudio?id=${item.id}`, '_blank')
          }
          else {
            //处于禁用状态
            Message.error('In Disable State')
          }
        }
        }
      >
        <IconSend /> 进入
      </Menu.Item>
    </Menu>
  );

  // Create Modal
  const [createform] = Form.useForm();
  const TextArea = Input.TextArea;
  const [visible, setvisible] = useState(false);

  // 创建projects方法
  const createprojects = () => {
    const newprojects = createform.getFieldsValue()

    apiClient.post('/api/projects_create', newprojects).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        Message.success(msg);
        projects_query()
      }
      else {
        Message.error(msg);
      }
    }).catch((err) => {
      Message.error('Create Error!')
    })
  }

  const [updateform] = Form.useForm();

  // interface UpdateModalArgs {
  //   id: string;
  //   title: string;
  //   desc: string;
  //   module: string;
  // }
  const [updatemodal_visible, setupdatemodal_visible] = useState(false)

  // Update Modal 回显
  const updateprojectsmodal = useCallback((item: any) => {

    setupdatemodal_visible(true);

    // 在这里更新表单的值
    updateform.setFieldsValue({
      id: item.id,
      title: item.title,
      desc: item.desc,
      module: item.module,
    });

  }, [updateform]);

  // 更新projects方法
  const updateprojects = () => {
    const projectsdata = updateform.getFieldsValue()
      projectsdata.module = projectsdata.module.replace(/[，、|。. ]/g, ','); 
    apiClient.post('/api/projects_update', projectsdata).then((res) => {
      const { msg, status, data } = res.data;
      if (status === 'success') {
        Message.success(msg);
        projects_query();
      } else {
        Message.error(msg);
      }
    }).catch((err) => {
      Message.error(err + '');
    });
  }

  // 删除projects方法
  const delprojects = (item) => {
    Modal.warning({
      title: '删除Project',
      content: (
        <div>
          <p>您确定要删除名为 {item.title} 的 Project 吗？</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="secondary" onClick={() => {
              Modal.destroyAll(); // 关闭所有模态框
            }}>
              取消
            </Button>
            <Button
              type="primary"
              status='warning'
              style={{ marginLeft: '12px' }}
              onClick={() => {
                // 在这里添加删除操作的代码
                apiClient.post('/api/projects_del', { id: item.id }).then((res) => {
                  const { msg, status, data } = res.data;
                  if (status === 'success') {
                    Message.success(msg);
                    projects_query();
                    Modal.destroyAll(); // 关闭所有模态框
                  } else {
                    Message.error(msg);
                  }
                }).catch((err) => {
                  Message.error('删除出错！');
                });
              }}>
              确认
            </Button>
          </div>
        </div>
      ),
      okButtonProps: {
        style: { display: 'none' }
      },
      cancelButtonProps: {
        style: { display: 'none' }
      }
    });
  }


  return (
    <div className={styles.container}>

      <div className={styles.projects_toolbar}>
        <Button type='primary'
          size='small'
          onClick={() => {
            createform.resetFields()
            setvisible(true)
          }}
        >
          {t['create']}
        </Button>
        {/* <div className={styles.projects_toolbar_tag}>
          {datatype.map((item, index) => (
            <Button
              type={gettype == item ? 'primary' : 'secondary'}
              size='mini'
              key={index}
              onClick={() => filtertype(item)}
            >
              {item}
            </Button>
          ))}
        </div> */}
      </div>

      <div className={styles.projects_content}>
        {data.map((item) => (


          <div className={styles.projects_content_item} key={item.id}>
            {/* <div className={styles.projects_content_item_top}> */}
            {/* <Tag>
                <span style={{fontSize:16,fontWeight:600,margin:0,color: item.ison=='1'?'#00ff00':'#ff0000'}}
                >•</span> {item.type}

              </Tag> */}
            {/* </div> */}
            <Dropdown
              droplist={dropList(item)}
              position='br'
            >
              <div className={styles.projects_content_item_mid}>
                <div
                  className={styles.projects_content_item_mid_icon}
                  style={{ backgroundColor: item.color }}>
                  {item.title?.slice(0, 1)}
                </div>
              </div>
            </Dropdown>
            <div className={styles.projects_content_item_bottom}>
              {item.title}
            </div>
          </div>
        ))}
      </div>


      <Modal
        title={t['create']}
        visible={visible}
        style={{width:'900px'}}
        onOk={() => {
          createform.validate().then(() => {
            null
          }).then(() => {
            createprojects()
            setvisible(false)
          }).catch(e => {
            Message.error(`${e}`);
          });
        }}
        onCancel={() => {
          setvisible(false)
        }}
        autoFocus={false}
        focusLock={true}
      >
        <Form
          form={createform}
          autoComplete='off'
          initialValues={{
            title: '',
            type: '',
          }}
          scrollToFirstError
        >

          <FormItem label='Title' field='title' rules={[{ required: true }]}>
            <Input placeholder='please enter...' />
          </FormItem>

          <FormItem label='Desc' field='desc'>
            <Input.TextArea
              maxLength={300}
              showWordLimit
              autoSize={{ minRows: 2, maxRows: 5 }}
              placeholder='please enter...'
            />
          </FormItem>

        </Form>
      </Modal>


      <Modal
        title={`${t['update']} Project`}
        visible={updatemodal_visible}
        onOk={() => {
          updateform.validate().then(() => {
            null
          }).then(() => {
            // 更新接口的方法
            updateprojects()
            setupdatemodal_visible(false)
          }).catch(e => {
            Message.error(`${e}`);
          });
        }}
        onCancel={() => {
          setupdatemodal_visible(false)
        }}
        autoFocus={false}
        focusLock={true}
      >
        <Form
          form={updateform}
          autoComplete='off'
          scrollToFirstError
        >

          <FormItem label='Id' field='id' disabled>
            <Input />
          </FormItem>

          <FormItem label='Title' field='title' rules={[{ required: true }]}>
            <Input placeholder='please enter...' />
          </FormItem>

          <FormItem label='Desc' field='desc' rules={[{ required: true }]}>
            <Input.TextArea
                maxLength={300}
                showWordLimit
                autoSize={{ minRows: 2, maxRows: 5 }}
                placeholder='please enter...'
            />
          </FormItem>

          <FormItem label='Module' field='module'>
            <Input
              allowClear
              placeholder='please enter...'
            />
          </FormItem>


        </Form>
      </Modal>
    </div>
  )

}

export default Projects;


