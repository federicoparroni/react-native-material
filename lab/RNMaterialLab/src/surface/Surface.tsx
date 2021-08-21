import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  createCornerRadius,
  ShapeCategory,
  ShapeCornerRadiusOptions,
  ShapeFamily,
  useTheme,
} from "../base";
import {
  TouchableCustomFeedback,
  TouchableCustomFeedbackProps,
} from "../button";

export interface SurfaceProps extends TouchableCustomFeedbackProps {
  category?: ShapeCategory | undefined;

  family?: ShapeFamily | undefined;

  cornerRadius?: ShapeCornerRadiusOptions | undefined;

  surfaceSize?:
    | { width?: number | undefined; height?: number | undefined }
    | undefined;

  backgroundColor?: string | undefined;

  borderWidth?: number | undefined;

  borderColor?: string | undefined;
}

const Surface: React.FC<SurfaceProps> = ({
  category,
  family,
  cornerRadius,
  surfaceSize,
  backgroundColor,
  borderWidth = 0,
  borderColor,
  children,
  ...rest
}) => {
  const theme = useTheme();

  const mergedCornerRadius = useMemo(
    () =>
      createCornerRadius(
        cornerRadius,
        theme.shapeScheme[category!].cornerRadius
      ),
    [cornerRadius, theme.shapeScheme, category]
  );

  const borderRadius = useMemo(
    () => ({
      borderTopStartRadius: mergedCornerRadius.topStart,
      borderTopEndRadius: mergedCornerRadius.topEnd,
      borderBottomStartRadius: mergedCornerRadius.bottomStart,
      borderBottomEndRadius: mergedCornerRadius.bottomEnd,
    }),
    [mergedCornerRadius]
  );

  const innerBorderRadius = useMemo(
    () => ({
      borderTopStartRadius: mergedCornerRadius.topStart - borderWidth,
      borderTopEndRadius: mergedCornerRadius.topEnd - borderWidth,
      borderBottomStartRadius: mergedCornerRadius.bottomStart - borderWidth,
      borderBottomEndRadius: mergedCornerRadius.bottomEnd - borderWidth,
    }),
    [mergedCornerRadius, borderWidth]
  );

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const halfBorder = borderWidth / 2;

  const points = [
    [halfBorder, mergedCornerRadius.topStart + halfBorder],
    [mergedCornerRadius.topStart + halfBorder, halfBorder],
    [width - mergedCornerRadius.topEnd - halfBorder, halfBorder],
    [width - halfBorder, mergedCornerRadius.topEnd + halfBorder],
    [width - halfBorder, height - mergedCornerRadius.bottomEnd - halfBorder],
    [width - mergedCornerRadius.bottomEnd - halfBorder, height - halfBorder],
    [mergedCornerRadius.bottomStart + halfBorder, height - halfBorder],
    [halfBorder, height - mergedCornerRadius.bottomStart - halfBorder],
  ].reduce((p, c) => `${p} ${c}`, "");

  return (family ?? theme.shapeScheme[category!].family) === "rounded" ? (
    <View style={[borderRadius, surfaceSize, { borderWidth, borderColor }]}>
      <View
        style={[
          innerBorderRadius,
          { overflow: "hidden" },
          surfaceSize && StyleSheet.absoluteFill,
        ]}>
        <TouchableCustomFeedback
          style={[surfaceSize && StyleSheet.absoluteFill]}
          {...rest}>
          <View
            style={[
              surfaceSize && StyleSheet.absoluteFill,
              { backgroundColor },
            ]}>
            {children}
          </View>
        </TouchableCustomFeedback>
      </View>
    </View>
  ) : (
    <View
      style={[surfaceSize]}
      onLayout={e => {
        setWidth(e.nativeEvent.layout.width);
        setHeight(e.nativeEvent.layout.height);
      }}>
      <Svg style={[{ position: "absolute" }]}>
        <Polygon
          points={points}
          strokeWidth={borderWidth}
          stroke={borderColor}
        />
      </Svg>
      <MaskedView
        style={[surfaceSize && StyleSheet.absoluteFill]}
        androidRenderingMode="software"
        maskElement={
          <Svg style={StyleSheet.absoluteFill}>
            <Polygon points={points} fill="black" />
          </Svg>
        }>
        <TouchableCustomFeedback
          style={[surfaceSize && StyleSheet.absoluteFill]}
          {...rest}>
          <View
            style={[
              surfaceSize && StyleSheet.absoluteFill,
              { backgroundColor },
            ]}>
            {children}
          </View>
        </TouchableCustomFeedback>
      </MaskedView>
    </View>
  );
};

Surface.defaultProps = {
  category: "small",
};

export default Surface;
