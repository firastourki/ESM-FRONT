pipeline {
  agent any

  environment {
    IMAGE     = 'yourdockerhubuser/fluencity-frontend'   // ← change to your Docker Hub username/repo
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        withCredentials([string(credentialsId: 'api-url-prod', variable: 'API_URL')]) {
          sh """
            docker build \\
              --build-arg API_URL=${API_URL} \\
              -t ${IMAGE}:${IMAGE_TAG} \\
              -t ${IMAGE}:latest \\
              .
          """
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId : 'docker-hub-creds',
          usernameVariable: 'DH_USER',
          passwordVariable: 'DH_PASS'
        )]) {
          sh """
            echo $DH_PASS | docker login -u $DH_USER --password-stdin
            docker push ${IMAGE}:${IMAGE_TAG}
            docker push ${IMAGE}:latest
          """
        }
      }
    }

    stage('Trigger Coolify Deploy') {
      steps {
        withCredentials([string(credentialsId: 'coolify-webhook', variable: 'WEBHOOK')]) {
          sh "curl -s -X GET \"${WEBHOOK}\""
        }
      }
    }

  }

  post {
    always  { sh 'docker logout || true' }
    success { echo "Build ${IMAGE_TAG} deployed to Coolify successfully." }
    failure { echo "Pipeline failed — check the stage logs above." }
  }
}
