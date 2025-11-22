import 'package:dartz/dartz.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:myapp/core/error/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserCredential>> signInWithEmailAndPassword(
    String email,
    String password,
  );
  Future<Either<Failure, UserCredential>> createUserWithEmailAndPassword(
    String email,
    String password,
  );
  Future<Either<Failure, void>> signOut();
}
