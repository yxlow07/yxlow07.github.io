// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format width=80

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:firebase_auth/firebase_auth.dart' as _i59;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;
import 'package:myapp/core/di/third_party_module.dart' as _i196;
import 'package:myapp/features/auth/data/repositories/auth_repository_impl.dart'
    as _i464;
import 'package:myapp/features/auth/domain/repositories/auth_repository.dart'
    as _i1008;
import 'package:myapp/features/auth/domain/usecases/get_auth_state_changes.dart'
    as _i516;
import 'package:myapp/features/auth/domain/usecases/sign_in.dart' as _i56;
import 'package:myapp/features/auth/domain/usecases/sign_out.dart' as _i1063;
import 'package:myapp/features/auth/domain/usecases/sign_up.dart' as _i90;
import 'package:myapp/features/auth/presentation/bloc/auth_bloc.dart' as _i169;

extension GetItInjectableX on _i174.GetIt {
  // initializes the registration of main-scope dependencies inside of GetIt
  _i174.GetIt init({
    String? environment,
    _i526.EnvironmentFilter? environmentFilter,
  }) {
    final gh = _i526.GetItHelper(this, environment, environmentFilter);
    final thirdPartyModule = _$ThirdPartyModule();
    gh.lazySingleton<_i59.FirebaseAuth>(() => thirdPartyModule.firebaseAuth);
    gh.lazySingleton<_i1008.AuthRepository>(
      () => _i464.AuthRepositoryImpl(gh<_i59.FirebaseAuth>()),
    );
    gh.factory<_i516.GetAuthStateChanges>(
      () => _i516.GetAuthStateChanges(gh<_i1008.AuthRepository>()),
    );
    gh.factory<_i56.SignIn>(() => _i56.SignIn(gh<_i1008.AuthRepository>()));
    gh.factory<_i1063.SignOut>(
      () => _i1063.SignOut(gh<_i1008.AuthRepository>()),
    );
    gh.factory<_i90.SignUp>(() => _i90.SignUp(gh<_i1008.AuthRepository>()));
    gh.factory<_i169.AuthBloc>(
      () =>
          _i169.AuthBloc(gh<_i516.GetAuthStateChanges>(), gh<_i1063.SignOut>()),
    );
    return this;
  }
}

class _$ThirdPartyModule extends _i196.ThirdPartyModule {}
