import * as Yup from "yup";

const validate = Yup.object().shape({
  amount: Yup.string()
    .required("Total Amount tidak boleh kosong"),
  password: Yup.string()
    .required("Password tidak boleh kosong"),
});

export default validate;