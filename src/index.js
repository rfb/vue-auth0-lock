import AuthService from "./AuthService"

export default {
  install: function (Vue, { clientId, domain, options }) {
    const authService = new AuthService(clientId, domain, options);

    const auth = Vue.observable({
      authenticated: authService.isAuthenticated(),
      userProfile: authService.getUserProfile()
    })

    authService.authNotifier.on("authChange", authState => {
      Vue.set(auth, 'authenticated', authState.authenticated);
      Vue.set(auth, 'userProfile', authState.userProfile);
    });

    Vue.prototype.$authService = Vue.authService = authService;
    Vue.prototype.$auth = auth;
  }
}