
import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:injectable/injectable.dart';
import 'package:myapp/features/auth/domain/usecases/get_auth_state_changes.dart';
import 'package:myapp/features/auth/domain/usecases/sign_out.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_event.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_state.dart';

@injectable
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final GetAuthStateChanges _getAuthStateChanges;
  final SignOut _signOut;
  StreamSubscription? _authStateSubscription;

  AuthBloc(this._getAuthStateChanges, this._signOut) : super(AuthInitial()) {
    on<AuthStateChanged>((event, emit) {
      if (event.user != null) {
        emit(Authenticated(event.user));
      } else {
        emit(Unauthenticated());
      }
    });

    on<SignOutButtonPressed>((event, emit) async {
      await _signOut();
    });

    _authStateSubscription = _getAuthStateChanges().listen((user) {
      add(AuthStateChanged(user));
    });
  }

  @override
  Future<void> close() {
    _authStateSubscription?.cancel();
    return super.close();
  }
}
