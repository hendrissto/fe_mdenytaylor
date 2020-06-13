import * as Yup from "yup";

const validate = Yup.object().shape({
  userName: Yup.string()
    .required("Username tidak boleh kosong"),
  email: Yup.string()
    .email("Format email salah.")
    .required("Email tidak boleh kosong"),
  firstName: Yup.string()
    .required("Nama Awal tidak boleh kosong"),
  lastName: Yup.string()
    .required("Nama Akhir tidak boleh kosong"),
  nationalPhoneNumber: Yup.number()
    .typeError('Nomor tidak valid')
    .required("Nomor tidak boleh kosong")
});

export default validate;
