import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';

export const ensureCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
            'Permission requise',
            "On a besoin d'accéder à la caméra pour prendre une photo."
        );
        return false;
    }
    return true;
};

export const ensureLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
            'Permission requise',
            "On a besoin d'accéder à vos photos pour sélectionner un document."
        );
        return false;
    }
    return true;
};

export const pickFromLibrary = async () => {
    const ok = await ensureLibraryPermission();
    if (!ok) return null;

    const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
    });

    if (res.canceled) return null;

    const asset = res.assets[0];
    return {
        uri: asset.uri,
        name: asset.fileName ?? `upload_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
    };
};

export const takePhoto = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) return null;

    const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
    });

    if (res.canceled) return null;

    const asset = res.assets[0];
    return {
        uri: asset.uri,
        name: asset.fileName ?? `camera_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
    };
};
