import { useReactiveVar } from "@apollo/client";
import { Player } from "@lottiefiles/react-lottie-player";
import { ColorPicker, GetProp, Space, Switch, Typography, ColorPickerProps, Row, Col, InputNumber, Card } from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import { socket } from "./api";
import { MessageType, Message, StoredAnimation, EventType } from "./types";
import { myNameVar, selectedAnimationVar } from "./vars";

type Color = GetProp<ColorPickerProps, 'value'>;

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
        <Col flex={ 0 }>
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
        <Col flex={ 0 }>
          <Space direction="vertical"> 
            { localAnimation?.data.layers?.map((l, index) => (
                <Space key={ `${index}${l.nm}${l.ind}` }>
                  <div>Color {`rgb(${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[0] || 0) * 255).toFixed(0)}, ${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[1] || 0) * 255).toFixed(0)}, ${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[2] || 0) * 255).toFixed(0)})`}</div>
                  <ColorPicker 
                    value={ `rgb(${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[0] || 0) * 255).toFixed(0)}, ${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[1] || 0) * 255).toFixed(0)}, ${((l.shapes?.[0]?.it?.find(c => c.nm === 'Fill')?.c?.k?.[2] || 0) * 255).toFixed(0)})` as Color }
                    format="rgb"
                    disabled={ disabled }
                    onOpenChange={ open => {
                      if (open) {
                        onFocus();
                      } else {
                        onBlur();
                      }
                    }}
                    onChangeComplete={ (color) => {

                      if (localAnimation) {
                        setLocalAnimation({ 
                          ...localAnimation, 
                          data: {
                            ...localAnimation?.data,
                            layers: localAnimation?.data?.layers?.map(layer => ({
                              ...layer, 
                              shapes: layer.nm === l.nm ? layer.shapes?.map(shape => ({
                                ...shape,
                                it: shape.it?.map(i => ({
                                  ...i,
                                  c: i.nm === 'Fill' ? {
                                    ...i.c,
                                    k: [color.toRgb().r / 255, color.toRgb().g / 255, color.toRgb().b / 255]
                                  } : i.c
                                }))
                              })) : layer.shapes
                            })) 
                          }
                        });
                      }
                    } }
                  />
                  <Text>{ l.nm }</Text>
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
                </Space>
            )) }
            </Space>
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