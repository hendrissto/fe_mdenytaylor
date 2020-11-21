import * as Yup from "yup";

const validate = Yup.object().shape({
  username: Yup.string()
    .email("Format email salah.")
    .required("Email tidak boleh kosong"),
  password: Yup.string()
    .required("Password tidak boleh kosong"),
});

export default validate;