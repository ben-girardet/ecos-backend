import { ImageInput } from '../image/image.model';
export declare class EditMeInput {
    firstname?: string;
    lastname?: string;
    picture?: ImageInput[];
    regId?: string;
    pushType?: 'apn' | 'fcm';
    pushTags?: string[];
    pushActive?: boolean;
}
