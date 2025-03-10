import {
	ArrayProperty,
	BasePropertySchema,
	CheckboxProperty,
	JsonProperty,
	LongTextProperty,
	NumberProperty,
	ObjectProperty,
	PropertyType,
	SecretTextProperty,
	ShortTextProperty,
} from "./base-prop";
import { BasicAuthProperty, BasicAuthPropertySchema } from "./basic-auth-prop";
import { DropdownProperty, DropdownPropertySchema } from "./dropdown-prop";
import { OAuth2Property, OAuth2PropertySchema } from "./oauth2-prop";

export interface PieceProperty {
	[name: string]: ShortTextProperty
	| LongTextProperty
	| OAuth2Property
	| CheckboxProperty
	| DropdownProperty<any>
	| NumberProperty
	| SecretTextProperty
	| BasicAuthProperty
	| ArrayProperty
	| ObjectProperty
	| JsonProperty;
}

export type StaticPropsValue<T extends PieceProperty> = {
	[P in keyof T]: T[P]['valueSchema'];
}

export const Property = {
	ShortText(request: BasePropertySchema): ShortTextProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.SHORT_TEXT };
	},
	Checkbox(request: BasePropertySchema): CheckboxProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.CHECKBOX };
	},
	LongText(request: BasePropertySchema): LongTextProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.LONG_TEXT };
	},
	Number(request: BasePropertySchema): NumberProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.NUMBER };
	},
	OAuth2(request: OAuth2PropertySchema): OAuth2Property {
		return { ...request, valueSchema: undefined, type: PropertyType.OAUTH2 };
	},
	BasicAuth(request: BasicAuthPropertySchema): BasicAuthProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.BASIC_AUTH };
	},
	Dropdown<T>(request: DropdownPropertySchema<T>): DropdownProperty<T> {
		return { ...request, valueSchema: undefined, type: PropertyType.DROPDOWN };
	},
	SecretText(request: BasePropertySchema): SecretTextProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.SECRET_TEXT };
	},
	Array(request: BasePropertySchema): ArrayProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.ARRAY };
	},
	Object(request: BasePropertySchema): ObjectProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.OBJECT };
	},
	Json(request: BasePropertySchema): JsonProperty {
		return { ...request, valueSchema: undefined, type: PropertyType.JSON };
	},
}
