
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_state.dart';
import 'package:myapp/features/auth/presentation/pages/sign_in_page.dart';
import 'package:myapp/features/auth/presentation/pages/sign_up_page.dart';

// Define your routes
final GoRouter router = GoRouter(
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const Scaffold(
          body: Center(
            child: Text('Home Screen'),
          ),
        );
      },
    ),
    GoRoute(
      path: '/signIn',
      builder: (BuildContext context, GoRouterState state) {
        return const SignInPage();
      },
    ),
    GoRoute(
      path: '/signUp',
      builder: (BuildContext context, GoRouterState state) {
        return const SignUpPage();
      },
    ),
  ],
  redirect: (BuildContext context, GoRouterState state) {
    final authState = context.read<AuthBloc>().state;
    final onAuthScreens = state.matchedLocation == '/signIn' || state.matchedLocation == '/signUp';

    if (authState is Unauthenticated && !onAuthScreens) {
      return '/signIn';
    }

    if (authState is Authenticated && onAuthScreens) {
      return '/';
    }

    return null;
  },
);
