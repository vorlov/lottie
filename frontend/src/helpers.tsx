import { ColorPicker, ColorPickerProps, GetProp, Space, TreeProps, Typography } from 'antd';
import { Shape, StoredAnimation } from './types';

const { Text } = Typography

type Color = GetProp<ColorPickerProps, 'value'>;

const updateShapeColorInAnimation = (animation: StoredAnimation, layerIndex: number, path: number[], rgb: { r: number; g: number; b: number }): StoredAnimation => {
  const newAnimation = { ...animation };
  let currentShapes = newAnimation.data.layers[layerIndex].shapes;

  for (let i = 0; i < path.length - 1; i++) {
    currentShapes = currentShapes?.[path[i]].it;
  }

  const shape = currentShapes?.[path[path.length - 1]];
  
  if (shape) {
    shape.c = { ...shape.c, k: [rgb.r / 255, rgb.g / 255, rgb.b / 255] };

    return newAnimation;
  }

  return animation;
}

export const getShapesTree = (
  layerIndex: number,
  disabled: boolean,
  onFocus: () => void,
  onBlur: () => void,
  localAnimation: StoredAnimation | null,
  setLocalAnimation: (animation: StoredAnimation) => void,
  shapes?: Shape[], 
  path: number[] = []
) => {
  const data: TreeProps['treeData'] = [];

  shapes?.forEach((shape, shapeIndex) => {
    const currentPath = [...path, shapeIndex]; 
    const key = `shape-${currentPath.join('-')}`;

    if (shape.nm) {
      const item = {
        title: (
          <Space>
            <Text>{ shape.nm }</Text>
            { shape.c?.k &&
              <ColorPicker
                value={ `rgb(${((shape.c?.k?.[0] || 0) * 255).toFixed(0)}, ${((shape.c?.k?.[1] || 0) * 255).toFixed(0)}, ${((shape.c?.k?.[2] || 0) * 255).toFixed(0)})` as Color }
                format="rgb"
                disabled={ disabled }
                onOpenChange={ open => {
                  if (open) {
                    onFocus();
                  } else {
                    onBlur();
                  }
                } }
                onChangeComplete={(color) => {
                  if (localAnimation) {
                    const updatedAnimation = updateShapeColorInAnimation(localAnimation, layerIndex, currentPath, color.toRgb());
                    setLocalAnimation(updatedAnimation);
                  }
                } }
              />
            }
          </Space>
        ),
        key,
        children: shape.it ? getShapesTree(
          layerIndex,
          disabled, 
          onFocus, 
          onBlur, 
          localAnimation, 
          setLocalAnimation, 
          shape.it, 
          currentPath
        ) : undefined,
      };

      if (!shape.c && !shape.it?.length) {
        return;
      }

      data.push(item);
    }
  });

  return data;
}