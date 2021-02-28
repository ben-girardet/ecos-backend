import { InputType, Field } from "type-graphql";

@InputType()
export class RegisterSMSInput {

    @Field({nullable: true})
    firstname?: string;

    @Field({nullable: true})
    lastname?: string;

    @Field()
    mobile: string;
}

@InputType()
export class ValidateRegistrationSMSInput {

    @Field()
    token: string;

    @Field()
    code: string;
}
