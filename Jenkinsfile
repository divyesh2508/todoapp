pipeline {
  agent any
  environment {
    IMAGE_NAME = "todo-app"
    IMAGE_TAG = "latest"
    AWS_REGION = "ap-south-1"
    AWS_DEFAULT_REGION = "ap-south-1"
    AWS_ACCOUNT_URL = "910253526187.dkr.ecr.ap-south-1.amazonaws.com"
    INSTANCE_IP = '13.201.6.7'
  }
  stages {
    stage('Build'){ 
        steps {
            echo 'Building'
            script {
              def myImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                docker.withRegistry("${AWS_ACCOUNT_URL}", "ecr:${AWS_DEFAULT_REGION}:aws-creds") {
                  myImage.push("${IMAGE_TAG}")
                }
              echo "${env.GIT_BRANCH}"
            }
        }
    }
    stage('Deploy') {
          steps {
            sshagent (credentials: ['aws-creds']) {
                sh '''
             
                ssh -o StrictHostKeyChecking=no 'jenkins'@$INSTANCE_IP "sh /apps/deploy-todo-app.sh"
    
                '''
             }
          }
       }
  }
post { 
        always { 
            cleanWs()
        }
    }
}
