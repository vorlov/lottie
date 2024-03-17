import { useReactiveVar } from "@apollo/client";
import { Player } from "@lottiefiles/react-lottie-player";
import { Space, Switch, Typography, Row, Col, InputNumber, Card, Tabs } from "antd";
import Tree from "antd/es/tree/Tree";
import { FC, useCallback, useEffect, useState } from "react";
import { socket } from "./api";
import { getShapesTree } from "./helpers";
import { MessageType, Message, StoredAnimation, EventType } from "./types";
import { myNameVar, selectedAnimationVar } from "./vars";

const { Text } = Typography;

const Editor: FC = () => {
  const selectedAnimation = useReactiveVar(selectedAnimationVar);
  const myName = useReactiveVar(myNameVar);

  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [localAnimation, setLocalAnimation] = useState<StoredAnimation | null>(selectedAnimation);

  useEffect(() => {
    setLocalAnimation(selectedAnimation);
  }, [selectedAnimation]);
  

  useEffect(() => {
    socket.on(EventType.Edit, (msg: Message) => {
      if (msg.type === MessageType.EditEnd && msg.animation) {
        setEditMessage(null);
        if (msg.animation.url === selectedAnimation?.url) {
          setLocalAnimation(msg.animation)
        }
      } else if (msg.type === MessageType.EditStart) {
        setEditMessage(msg)
      }
    });
  }, [selectedAnimation?.url]);


  const onFocus = useCallback(() => {
    const message: Message = {
      type: MessageType.EditStart,
      editBy: myName,
    };

    socket.emit(EventType.Edit, message);
  }, [myName]);

  const onBlur = useCallback(() => {
    if (localAnimation) {
      const message: Message = {
        type: MessageType.EditEnd,
        animation: localAnimation,
      };

      socket.emit(EventType.Edit, message);
    }    
  }, [localAnimation]);

  if (!localAnimation) {
    return null;
  }

  const disabled = !!editMessage?.editBy && editMessage?.editBy !== myName;
  
  return (
    <Card>
      <Row gutter={[16, 16]} align="middle">
        <Col span={ 12 }>
          <Player
            src={ {
              ...localAnimation.data,
              h: localAnimation.data.h / localAnimation.scale,
              w: localAnimation.data.w / localAnimation.scale
            } }
            background="transparent"
            style={{ 
              width: 500, 
              height:  500,
              cursor: 'pointer',
            }}
            loop
            autoplay
          />
        </Col>
        <Col span={ 12 }>
          <Tabs 
            tabPosition="left"
            items={ localAnimation?.data.layers?.map((l, layerIndex) => ({ 
              label: `${l.nm}`, 
              disabled,
              key: `${layerIndex}${l.nm}${l.shapes?.length}`,
              icon: (
                <Switch 
                    checkedChildren="Show" 
                    unCheckedChildren="Hide" 
                    value={ !l.hd }
                    disabled={ disabled }
                    onChange={ (show) => {
                      if (localAnimation) {
                        const animation = { 
                          ...localAnimation, 
                          data: {
                            ...localAnimation?.data,
                            layers: localAnimation?.data?.layers?.map(layer => ({
                              ...layer,
                              hd: layer.nm === l.nm ? !show : layer.hd
                            }))
                          }
                        };

                        setLocalAnimation(animation)

                        const message: Message = {
                          type: MessageType.EditEnd,
                          animation,
                        };
                  
                        socket.emit(EventType.Edit, message);
                      }
                    } }
                  />
              ),
              children: (
                <Space direction="vertical" style={ { width: '100%'}}>
                  <Text>Shapes</Text>
                  <Tree 
                    treeData={ 
                      getShapesTree(
                        layerIndex,
                        disabled,
                        onFocus,
                        onBlur,
                        localAnimation,
                        setLocalAnimation,
                        l?.shapes
                      ) 
                    } 
                    defaultExpandAll
                  />
                </Space>
              )
            })) }
          />
        </Col>
      </Row>
      <Row gutter={ [32,32]}>
        <Col span={ 8 }>
          <Space>
          <Text>Speed</Text>
          <InputNumber
            min={ 0 } 
            disabled={ disabled }
            value={ Number(localAnimation?.data.fr) }
            precision={ 0 }
            onFocus={ onFocus }
            onChange={ (fr) => {
              if (fr) {
                const data: StoredAnimation = {
                  ...localAnimation,
                  data: {
                    ...localAnimation?.data,
                    fr
                  }
                }

                setLocalAnimation(data);
              }
            }}
            onBlur={ onBlur } 
          />
          </Space>
        </Col>
      </Row>
      <Row gutter={ [32,32]}>
        <Col span={ 8 }>
          <Space>
          <Text>Scale</Text>
          <InputNumber 
            min={ 0.1 }
            step={ 0.1 }
            max={ 5 }
            value={ localAnimation.scale }
            disabled={ disabled }
            onFocus={ onFocus }
            onChange={ (value) => {
              if (localAnimation && value) {
                // TODO Scale by scale prop of json or by width and height?
                setLocalAnimation({ 
                  ...localAnimation, 
                  scale: value,
                });
              }
            } }
            onBlur={ onBlur } 
          />
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default Editor;