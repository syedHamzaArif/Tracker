import React, { useState } from 'react';
import { Input, Icon } from 'react-native-elements';
import { View } from 'react-native';
import { height } from '#util/';
import Typography from './Typography';
import { colors } from '#res/colors';
import { getFonts } from '#util/index';


function InputComponent(props, ref) {

    let inputElement = null;

    const [hide, setHide] = useState(true);
    switch (props.elementType) {
        case ('input'):
            inputElement =
                props.visible ?
                    <>
                        <Typography variant="small" size={13} color={colors.textBody} style={{
                            marginVertical: 5,
                        }}>{props.elementConfig.placeholder}</Typography>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            overflow: 'hidden',
                        }}>
                            <Input
                                ref={ref}
                                errorMessage={props.showError && !props.isValid ? props.errorMessage : ''}
                                errorStyle={{
                                    color: colors.warning,
                                }}
                                leftIcon={props.leftIcon}
                                placeholderTextColor={colors.subtitleText}
                                {...props.elementConfig}
                                value={props.value}
                                onChangeText={props.change}
                                blurOnSubmit={props.elementConfig.blurOnSubmit ?? false}
                                containerStyle={{ paddingHorizontal: 0 }}
                                inputStyle={{
                                    padding: 0,
                                    paddingLeft: 10,
                                    fontSize: 14,
                                    fontFamily: getFonts().regular,
                                    // ...props.inputStyle,
                                }}
                                returnKeyType={props.elementConfig.blurOnSubmit ? 'done' : 'next'}
                                onSubmitEditing={props.onSubmitHandler.bind(this, props.elementConfig.name)}
                                inputContainerStyle={{
                                    borderColor: props.showError && !props.isValid ? colors.warning : colors.textSecondary,
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                    width: '100%',
                                    height: 42,
                                    // ...props.inputContainerStyle,
                                }}
                                secureTextEntry={props.elementConfig.name === 'password' ? hide : false}
                                rightIcon={
                                    props.elementConfig.name === 'password' && !props.noUnlock &&
                                    <Icon
                                        underlayColor="transparent"
                                        name={hide ? 'lock' : 'unlock-alt'}
                                        type="font-awesome"
                                        iconStyle={{ marginRight: 10 }}
                                        hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                                        onPress={() => setHide(!hide)}
                                    />
                                }
                            // leftIcon={props.leftIcon}
                            />
                        </View>
                    </>
                    : null
                ;
            break;
        case ('emailph'):
            inputElement =
                props.visible ?
                    <View>
                        <Typography size={10}>{props.emailPhMessage}</Typography>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            overflow: 'hidden',

                            // marginVertical: 4,
                        }}>
                            <Input
                                errorMessage={props.showError ? props.errorMessage : ''}
                                errorStyle={{
                                    ...props.errorStyle,
                                }}
                                blurOnSubmit={false}
                                leftIcon={props.leftIcon}
                                placeholderTextColor={colors.textSecondary}
                                {...props.elementConfig}
                                value={props.value}
                                onChangeText={props.change}
                                containerStyle={{ height: height * 0.1, paddingHorizontal: 0 }}
                                inputStyle={{
                                    padding: 0,
                                    paddingLeft: 10,
                                    fontSize: 14,
                                    ...props.inputStyle,
                                }}
                                inputContainerStyle={{
                                    borderColor: colors.textSecondary,
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                    width: '100%',
                                    ...props.inputContainerStyle,
                                }}
                                secureTextEntry={props.elementConfig.name === 'password' ? hide : false}
                                rightIcon={
                                    props.elementConfig.name === 'password' && !props.noUnlock &&
                                    <Icon
                                        underlayColor="transparent"
                                        name={hide ? 'lock' : 'unlock-alt'}
                                        type="font-awesome"
                                        iconStyle={{ marginRight: 10 }}
                                        hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                                        onPress={() => setHide(!hide)}
                                    />
                                }
                            // leftIcon={props.leftIcon}
                            />
                        </View>
                    </View>
                    : null
                ;
            break;
        case ('input-mask'):
            inputElement =
                props.visible ?
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderColor: colors.textSecondary,
                        borderWidth: 1.5,
                        borderRadius: 10,
                        height: 50,
                        marginVertical: 4,
                        marginBottom: 20,
                    }}>
                        {props.leftIcon}
                        <Input
                            {...props.elementConfig}
                            style={{
                                margin: 0,
                                paddingTop: 2,
                                paddingBottom: 2,
                                marginBottom: 12,
                                width: '100%',
                                ...props.inputContainerStyle,
                                // borderBottomWidth: 1,
                                borderColor: '#eee',
                                color: colors.textPrimary,
                                paddingLeft: 16,
                                fontSize: 14,
                                textAlignVertical: 'bottom',
                                fontFamily: getFonts().regular,

                            }}
                            onChangeText={props.change}
                            value={props.value}
                            textContentType="telephoneNumber"
                            keyboardType="phone-pad"
                        />
                    </View>
                    : null;
            break;
        // case ('radio'):
        //     inputElement =
        //         <>
        //             <View style={{
        //                 flexDirection: 'row',
        //                 alignItems: 'center',
        //             }}>
        //                 {props.leftIcon}
        //                 <RadioButton.Group
        //                     onValueChange={props.change}
        //                     value={props.value}
        //                 >
        //                     {props.elementConfig.radio.map((radio, index) => {
        //                         return (
        //                             <View key={index.toString()} style={{
        //                                 marginRight: props.small ? 6 : 16,
        //                                 flexDirection: 'row',
        //                                 alignItems: 'center',
        //                             }}>
        //                                 <RadioButton
        //                                     uncheckedColor={colors.primaryGreen}
        //                                     color={colors.primaryGreen}
        //                                     value={radio.value}
        //                                 />
        //                                 <Typography style={{
        //                                     margin: 0,
        //                                     padding: 0,
        //                                     fontFamily: 'Lato-Regular',
        //                                 }} >{radio.label}</Typography>
        //                             </View>
        //                         );
        //                     })}
        //                 </RadioButton.Group>
        //             </View>
        //         </>;
        //     break;
        // case 'location':
        //     inputElement =
        //         <TouchableOpacity
        //             activeOpacity={0.7}
        //             onPress={props.onPress.bind(this, props.elementType)}
        //             style={styles(colors).formItem}>
        //             {props.leftIcon}
        //             <View style={styles(colors).subView}>
        //                 <Typography style={{ color: colors.subtitleText, fontSize: 18, paddingLeft: 2 }}>{props.elementConfig.placeholder}</Typography>
        //                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //                     <Typography>{props.t(props.value)}</Typography>
        //                     <Icon
        //                         name="arrow-drop-down"
        //                         type="material"
        //                         size={24}
        //                         color={colors.inactiveGray}
        //                     />
        //                 </View>
        //             </View>
        //         </TouchableOpacity>;
        //     break;
        default:
            inputElement =
                <Input
                    placeholderTextColor={colors.darkBlue + 'ee'}
                    {...props.elementConfig}
                    value={props.value}
                    onChangeText={props.change}
                    errorStyle={{
                        fontFamily: getFonts().regular,
                        margin: 5,
                    }}
                    inputStyle={{ fontFamily: getFonts().regular, color: colors.darkBlue }}
                    // containerStyle={{ marginBottom: 16 }}
                    secureTextEntry={props.elementConfig.name === 'password' ? hide : false}
                    rightIcon={
                        props.elementConfig.name === 'password' &&
                        <Icon
                            underlayColor="transparent"
                            name={hide ? 'lock' : 'unlock-alt'}
                            type="font-awesome"
                            iconStyle={{ marginRight: 10 }}
                            hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                            onPress={() => setHide(!hide)}
                        />
                    }
                />;
            break;
    }
    return inputElement;
}

export default React.forwardRef(InputComponent);
