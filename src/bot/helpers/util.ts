const uzPhoneNumber = /^998[0-9]{9}$/;

export const phoneCheck = (phone: string): boolean => uzPhoneNumber.test(phone);
