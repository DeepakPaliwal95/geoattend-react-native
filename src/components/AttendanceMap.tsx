import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Circle, UrlTile } from 'react-native-maps';
import { LocationData } from '../utils/location.utils';
import { OFFICE_LOCATION, GEOFENCE_RADIUS } from '../constants/location';
import { ThemeColors } from '../utils/theme.utils';
import { Ionicons, IconNames, fontSize } from '../utils/fontIcons.utils';
import { wp } from '../utils/responsive.utils';

interface AttendanceMapProps {
  userLocation: LocationData | null;
  isInside: boolean;
  style?: object;
}

export default function AttendanceMap({
  userLocation,
  isInside,
  style,
}: AttendanceMapProps) {
  const mapRef = useRef<MapView>(null);
  const hasCenteredInitial = useRef(false);

  // Center camera once when user location becomes available
  useEffect(() => {
    if (userLocation && !hasCenteredInitial.current && mapRef.current) {
      hasCenteredInitial.current = true;
      mapRef.current.animateToRegion(
        {
          latitude: (userLocation.latitude + OFFICE_LOCATION.latitude) / 2,
          longitude: (userLocation.longitude + OFFICE_LOCATION.longitude) / 2,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        800,
      );
    }
  }, [userLocation]);

  const circleStrokeColor = isInside
    ? ThemeColors.geofenceInsideStroke
    : ThemeColors.geofenceOutsideStroke;

  const circleFillColor = isInside
    ? ThemeColors.geofenceInsideFill
    : ThemeColors.geofenceOutsideFill;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: OFFICE_LOCATION.latitude,
          longitude: OFFICE_LOCATION.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {/* Offline & Independent Map Tiles */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={1}
        />

        {/* 100m Geofence Circle around office */}
        <Circle
          center={OFFICE_LOCATION}
          radius={GEOFENCE_RADIUS}
          strokeWidth={2}
          strokeColor={circleStrokeColor}
          fillColor={circleFillColor}
          zIndex={2}
        />

        {/* Fixed Office Marker */}
        <Marker
          coordinate={OFFICE_LOCATION}
          title="Office"
          description="GeoAttend Office (100m radius)"
          anchor={{ x: 0.5, y: 1.0 }}
          tracksViewChanges={true}
          zIndex={3}
        >
          <View style={styles.officeMarkerContainer}>
            <Ionicons
              name={IconNames.locationFilled}
              size={fontSize.f32}
              color={ThemeColors.danger}
            />
            <View style={styles.officeDot} />
          </View>
        </Marker>

        {/* Live User Location Marker */}
        {userLocation &&
          userLocation.latitude !== undefined &&
          userLocation.longitude !== undefined && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              title="You"
              tracksViewChanges={true}
              zIndex={4}
            >
              <View style={styles.userMarkerContainer}>
                <View style={styles.userMarkerOuterRing}>
                  <View style={styles.userMarkerInnerDot} />
                </View>
              </View>
            </Marker>
          )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  officeMarkerContainer: {
    width: wp('10%'),
    height: wp('12%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  officeDot: {
    position: 'absolute',
    top: wp('3.5%'),
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: ThemeColors.white,
  },
  userMarkerContainer: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuterRing: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: ThemeColors.userMarkerRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInnerDot: {
    width: wp('3.5%'),
    height: wp('3.5%'),
    borderRadius: wp('1.75%'),
    backgroundColor: ThemeColors.primary,
    borderWidth: 2,
    borderColor: ThemeColors.white,
  },
});
