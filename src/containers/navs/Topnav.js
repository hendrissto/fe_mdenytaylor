import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { Formik } from "formik";
import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  // Input
} from "reactstrap";
import Swal from "sweetalert2";
import Loading from "../../containers/pages/Spinner";
import { InputText } from 'primereact/inputtext';




import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import randomstring from "randomstring";


// import IntlMessages from "../../helpers/IntlMessages";
import {
  setContainerClassnames,
  clickOnMobileMenu,
  logoutUser,
  changeLocale
} from "../../redux/actions";

import {
  menuHiddenBreakpoint,
  searchPath,
} from "../../constants/defaultValues";

import { MobileMenuIcon, MenuIcon } from "../../components/svg";
// import TopnavEasyAccess from "./Topnav.EasyAccess";
// import TopnavNotifications from "./Topnav.Notifications";
// import TopnavDarkSwitch from "./Topnav.DarkSwitch";

import { getDirection, setDirection } from "../../helpers/Utils";
import UsersRestService from "../../api/usersRestService";
import withReactContent from "sweetalert2-react-content";
import { MessageParserService } from '../../api/common/messageParserService';


const MySwal = withReactContent(Swal);

class TopNav extends Component {
  constructor(props) {
    super(props);
    this.userRestService = new UsersRestService();
    this.messageParserService = new MessageParserService();

    this.submitResetPassword = this.submitResetPassword.bind(this);
    this.state = {
      isInFullScreen: false,
      searchKeyword: "",
      user: JSON.parse(localStorage.getItem("user")),
      redirect: true,
      oldPassword: '',
      newPassword: '',
      loading: false,
      isChangePassword: false,
    };
  }

  handleChangeLocale = (locale, direction) => {
    this.props.changeLocale(locale);

    const currentDirection = getDirection().direction;
    if (direction !== currentDirection) {
      setDirection(direction);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  isInFullScreen = () => {
    return (
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement &&
        document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement &&
        document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null)
    );
  };
  handleSearchIconClick = e => {
    if (window.innerWidth < menuHiddenBreakpoint) {
      let elem = e.target;
      if (!e.target.classList.contains("search")) {
        if (e.target.parentElement.classList.contains("search")) {
          elem = e.target.parentElement;
        } else if (
          e.target.parentElement.parentElement.classList.contains("search")
        ) {
          elem = e.target.parentElement.parentElement;
        }
      }

      if (elem.classList.contains("mobile-view")) {
        this.search();
        elem.classList.remove("mobile-view");
        this.removeEventsSearch();
      } else {
        elem.classList.add("mobile-view");
        this.addEventsSearch();
      }
    } else {
      this.search();
    }
  };
  addEventsSearch = () => {
    document.addEventListener("click", this.handleDocumentClickSearch, true);
  };
  removeEventsSearch = () => {
    document.removeEventListener("click", this.handleDocumentClickSearch, true);
  };

  handleDocumentClickSearch = e => {
    let isSearchClick = false;
    if (
      e.target &&
      e.target.classList &&
      (e.target.classList.contains("navbar") ||
        e.target.classList.contains("simple-icon-magnifier"))
    ) {
      isSearchClick = true;
      if (e.target.classList.contains("simple-icon-magnifier")) {
        this.search();
      }
    } else if (
      e.target.parentElement &&
      e.target.parentElement.classList &&
      e.target.parentElement.classList.contains("search")
    ) {
      isSearchClick = true;
    }

    if (!isSearchClick) {
      const input = document.querySelector(".mobile-view");
      if (input && input.classList) input.classList.remove("mobile-view");
      this.removeEventsSearch();
      this.setState({
        searchKeyword: ""
      });
    }
  };
  handleSearchInputChange = e => {
    this.setState({
      searchKeyword: e.target.value
    });
  };
  handleSearchInputKeyPress = e => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  search = () => {
    this.props.history.push(searchPath + "/" + this.state.searchKeyword);
    this.setState({
      searchKeyword: ""
    });
  };

  toggleFullScreen = () => {
    const isInFullScreen = this.isInFullScreen();

    var docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    this.setState({
      isInFullScreen: !isInFullScreen
    });
  };

  handleLogout() {
    window.location = '/user/login'
  };

  menuButtonClick = (e, menuClickCount, containerClassnames) => {
    e.preventDefault();

    setTimeout(() => {
      var event = document.createEvent("HTMLEvents");
      event.initEvent("resize", false, false);
      window.dispatchEvent(event);
    }, 350);
    this.props.setContainerClassnames(
      ++menuClickCount,
      containerClassnames,
      this.props.selectedMenuHasSubItems
    );
  };
  mobileMenuButtonClick = (e, containerClassnames) => {
    e.preventDefault();
    this.props.clickOnMobileMenu(containerClassnames);
  };

  submitResetPassword(formValue) {
    this.setState({ loading: true });
    
    this.userRestService.changePassword(formValue).subscribe(res => {
      MySwal.fire({
        type: "success",
        title: "Berhasil Ubah Password.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
      this.handleLogout();
    }, err => {
      const message = this.messageParserService.parse(err.data) || 'Gagal Ubah password.';
      MySwal.fire({
        type: "error",
        title: message[0],
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
        customClass: "swal-height"
      });
    });
    this.setState({
      loading: false,
      isChangePassword: false
    })
  }

  isChangePasswordComp() {

    return <>
      <Modal isOpen={this.state.isChangePassword}>
        <ModalHeader>Reset Password</ModalHeader>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: this.state.newPassword
          }}
          onSubmit={this.submitResetPassword}
        >
          {props => (
            <form onSubmit={props.handleSubmit}>
              <ModalBody>
                <Table>
                  <tbody>
                    <tr>
                      <td colSpan={2} style={{ verticalAlign: 'middle' }}>Password Lama</td>
                      <td style={{ verticalAlign: 'middle' }}>:</td>
                      <td colSpan={2} style={{ verticalAlign: 'middle' }}>
                        <InputText
                          name="oldPassword"
                          type="text"
                          value={props.values.oldPassword}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ verticalAlign: 'middle' }}>Password Baru</td>
                      <td style={{ verticalAlign: 'middle' }}>:</td>
                      <td colSpan={2} style={{ verticalAlign: 'middle' }}>
                        <InputText
                          readOnly
                          name="newPassword"
                          type="text"
                          value={props.values.newPassword}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                        />
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <a
                          href
                          className="text-info mt-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            this.setState({
                              newPassword: randomstring.generate({
                                length: 15,
                                charset: 'alphabetic'
                              }),
                            });
                            props.values.newPassword = this.state.newPassword
                          }
                          }>
                          <span>
                            Generate
                                </span>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  style={{
                    borderRadius: 6
                  }}
                >
                  Simpan
                  </Button>
                <Button
                  color="primary"
                  outline
                  onClick={() => {
                    this.setState({
                      isChangePassword: false,
                      oldPassword: '',
                      newPassword: ''
                    });
                  }}
                  style={{
                    borderRadius: 6
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </form>
          )}
        </Formik>
      </Modal>
    </>
  }

  render() {
    const { containerClassnames, menuClickCount } = this.props;
    // if (this.state.redirect === true) {
    //   this.setState({ redirect: false });
    //   return <Redirect to="/user/login" />;
    // }
    // const { messages } = this.props.intl;
    return (
      <>
        <nav className="navbar fixed-top" style={{
          height: 55,
          padding: 6,
        }}>
          <div className="d-flex align-items-center navbar-left">
            <NavLink
              to="#"
              className="menu-button d-none d-md-block"
              onClick={e =>
                this.menuButtonClick(e, menuClickCount, containerClassnames)
              }
            >
              <MenuIcon />
            </NavLink>
            <NavLink
              to="#"
              className="menu-button-mobile d-xs-block d-sm-block d-md-none"
              onClick={e => this.mobileMenuButtonClick(e, containerClassnames)}
            >
              <MobileMenuIcon />
            </NavLink>

            {/* <div className="search" data-search-path="/app/pages/search">
            <Input
              name="searchKeyword"
              id="searchKeyword"
              placeholder={messages["menu.search"]}
              value={this.state.searchKeyword}
              onChange={e => this.handleSearchInputChange(e)}
              onKeyPress={e => this.handleSearchInputKeyPress(e)}
            />
            <span
              className="search-icon"
              onClick={e => this.handleSearchIconClick(e)}
            >
              <i className="simple-icon-magnifier" />
            </span>
          </div> */}
            {/*
          <div className="d-inline-block">
            <UncontrolledDropdown className="ml-2">
              <DropdownToggle
                caret
                color="light"
                size="sm"
                className="language-button"
              >
                <span className="name">{locale.toUpperCase()}</span>
              </DropdownToggle>
              <DropdownMenu className="mt-3" right>
                {localeOptions.map(l => {
                  return (
                    <DropdownItem
                      onClick={() => this.handleChangeLocale(l.id, l.direction)}
                      key={l.id}
                    >
                      {l.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
           */}
            {/* <div className="position-relative d-none d-none d-lg-inline-block">
            <a
              className="btn btn-outline-primary btn-sm ml-2"
              target="_top"
              href="https://themeforest.net/cart/configure_before_adding/22544383?license=regular&ref=ColoredStrategies&size=source"
            >
              <IntlMessages id="user.buy" />
            </a>
          </div> */}
          </div>
          <a className="navbar-logo" href="/">
            <span className="logo d-none d-xs-block" />
            <span className="logo-mobile d-block d-xs-none" />
          </a>

          <div className="navbar-right">
            {/* {isDarkSwitchActive && <TopnavDarkSwitch/>} */}
            {/* <div className="header-icons d-inline-block align-middle">
            <TopnavEasyAccess />
            <TopnavNotifications />
            <button
              className="header-icon btn btn-empty d-none d-sm-inline-block"
              type="button"
              id="fullScreenButton"
              onClick={this.toggleFullScreen}
            >
              {this.state.isInFullScreen ? (
                <i className="simple-icon-size-actual d-block" />
              ) : (
                <i className="simple-icon-size-fullscreen d-block" />
              )}
            </button>
          </div> */}
            <div className="user d-inline-block">
              <UncontrolledDropdown className="dropdown-menu-right">
                <DropdownToggle className="p-0" color="empty">
                  <span className="name mr-1">Admin</span>
                  <span>
                    <img alt="Profile" src="/assets/img/profile.jpg" />
                  </span>
                </DropdownToggle>
                <DropdownMenu className="mt-3" right>
                  {/* <DropdownItem>Account</DropdownItem> */}
                  {/* <DropdownItem>Features</DropdownItem> */}
                  {/* <DropdownItem>History</DropdownItem> */}
                  {/* <DropdownItem>Support</DropdownItem> */}
                  {/* <DropdownItem divider /> */}
                  <DropdownItem onClick={() => this.setState({
                    isChangePassword: true,
                    newPassword: randomstring.generate({
                      length: 15,
                      charset: 'alphabetic'
                    })
                  })}>
                    Ganti Password
                </DropdownItem>
                  <DropdownItem onClick={() => this.handleLogout()}>
                    Sign out
                </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>
        </nav>
        {this.state.isChangePassword && (
          this.isChangePasswordComp()
        )}
        {this.state.loading && <Loading />}
      </>
    );
  }
}

const mapStateToProps = ({ menu, settings }) => {
  const { containerClassnames, menuClickCount, selectedMenuHasSubItems } = menu;
  const { locale } = settings;
  return {
    containerClassnames,
    menuClickCount,
    selectedMenuHasSubItems,
    locale
  };
};


export default injectIntl(
  connect(
    mapStateToProps,
    { setContainerClassnames, clickOnMobileMenu, logoutUser, changeLocale }
  )(TopNav)
);
