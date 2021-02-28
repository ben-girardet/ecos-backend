import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterEmailInput {

    @Field({nullable: true})
    firstname?: string;

    @Field({nullable: true})
    lastname?: string;

    @Field({nullable: true})
    email?: string;

    @Field({nullable: true})
    mobile?: string;
}

@InputType()
export class ValidateRegistrationEmailInput {

    @Field()
    token: string;

    @Field()
    code: string;

    // TODO: once the process of login is finished to go only with SMS
    // then we won't need this anymore
    @Field({nullable: true})
    type: 'email' | 'mobile';

    // TODO: once the process of login is finished to go only with SMS
    // then we won't need this anymore
    @Field({nullable: true})
    password: string;
}
