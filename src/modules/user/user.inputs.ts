import { ImageInput } from '../image/image.model';
import { InputType, Field } from "type-graphql";

@InputType()
export class EditMeInput {

    @Field({nullable: true})
    firstname?: string;

    @Field({nullable: true})
    lastname?: string;

    @Field(type => [ImageInput], {nullable: true})
    picture?: ImageInput[];

    @Field(() => String, {nullable: true})
    regId?: string;

    @Field(() => String, {nullable: true})
    pushType?: 'apn' | 'fcm';

    @Field(() => [String], {nullable: true})
    pushTags?: string[];

    @Field({nullable: true})
    pushActive?: boolean;
}

@InputType()
export class EditUserInput {

    @Field({nullable: true})
    roles?: string[];

    @Field({nullable: true})
    state?: number;
}
