################################################################################
# Automatically-generated file. Do not edit!
# Toolchain: GNU Tools for STM32 (12.3.rel1)
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../drivers/bsp/Stepper/stm32g4_stepper_motor.c 

OBJS += \
./drivers/bsp/Stepper/stm32g4_stepper_motor.o 

C_DEPS += \
./drivers/bsp/Stepper/stm32g4_stepper_motor.d 


# Each subdirectory must supply rules for building sources it contributes
drivers/bsp/Stepper/%.o drivers/bsp/Stepper/%.su drivers/bsp/Stepper/%.cyclo: ../drivers/bsp/Stepper/%.c drivers/bsp/Stepper/subdir.mk
	arm-none-eabi-gcc "$<" -mcpu=cortex-m4 -std=gnu11 -g3 -DDEBUG -DUSE_HAL_DRIVER -DSTM32G431xx -c -I../core/Inc -I../drivers/stm32g4xx_hal/Inc -I../drivers/stm32g4xx_hal/Inc/Legacy -I../drivers/cmsis/Device/ST/STM32G4xx/Include -I../drivers/cmsis/Include -I../app -I../drivers/bsp -Og -ffunction-sections -fdata-sections -Wall -fstack-usage -fcyclomatic-complexity -MMD -MP -MF"$(@:%.o=%.d)" -MT"$@" --specs=nano.specs -mfpu=fpv4-sp-d16 -mfloat-abi=hard -mthumb -o "$@"

clean: clean-drivers-2f-bsp-2f-Stepper

clean-drivers-2f-bsp-2f-Stepper:
	-$(RM) ./drivers/bsp/Stepper/stm32g4_stepper_motor.cyclo ./drivers/bsp/Stepper/stm32g4_stepper_motor.d ./drivers/bsp/Stepper/stm32g4_stepper_motor.o ./drivers/bsp/Stepper/stm32g4_stepper_motor.su

.PHONY: clean-drivers-2f-bsp-2f-Stepper

