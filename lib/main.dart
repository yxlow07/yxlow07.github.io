
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:myapp/core/config/app_theme.dart';
import 'package:myapp/core/config/router.dart';
import 'package:myapp/core/di/service_locator.dart';
import 'package:myapp/features/auth/presentation/bloc/auth_bloc.dart';

void main() {
  configureDependencies();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => getIt<AuthBloc>(),
      child: MaterialApp.router(
        routerConfig: router,
        title: 'Workout Tracker',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system, // Automatically use light or dark theme
      ),
    );
  }
}
