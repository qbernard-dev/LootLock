/**
 *******************************************************************************
 * @file 	main.c
 * @author 	jjo
 * @date 	Mar 29, 2024
 * @brief	Fichier principal de votre projet sur carte Nucléo STM32G431KB
 *******************************************************************************
 */

#include "config.h"
#include "stm32g4_sys.h"
#include "stm32g4_systick.h"
#include "stm32g4_gpio.h"
#include "stm32g4_uart.h"
#include "stm32g4_utils.h"
#include "NFC03A1/stm32g4_nfc03a1.h"
#include "NFC03A1/lib_nfc/common/lib_95HFConfigManager.h"
#include "NFC03A1/CR95HF/drv_95HF.h"
#include "TFT_ili9341/stm32g4_ili9341.h"
#include "stm32g4_uart.h"
#include <stdio.h>

#define BLINK_DELAY		100	//ms

typedef enum {
	    SEND_NONE,
	    SEND_KEYBOARD,
	    SEND_NFC
	} SendSource;
	typedef enum
	{
		STATE_INIT=0,
		STATE_WAIT,
		STATE_WAIT_RECEPTION,
		STATE_OPENING,
		STATE_SEND,
		STATE_ERROR
	}state_e;
void state_machine(void);
void write_LED(bool b)
{
	HAL_GPIO_WritePin(LED_GREEN_GPIO, LED_GREEN_PIN, b);
}

bool char_received(uart_id_t uart_id)
{
	if( BSP_UART_data_ready(uart_id) )	/* Si un caractère est reçu sur l'UART 2*/
	{
		/* On "utilise" le caractère pour vider le buffer de réception */
		BSP_UART_get_next_byte(uart_id);
		return true;
	}
	else
		return false;
}

void heartbeat(void)
{
	while(! char_received(UART2_ID) )
	{
		write_LED(true);
		HAL_Delay(50);
		write_LED(false);
		HAL_Delay(1500);
	}
}


/**
  * @brief  Point d'entrée de votre application
  */
int main(void)
	{
	/* Cette ligne doit rester la première de votre main !
	 * Elle permet d'initialiser toutes les couches basses des drivers (Hardware Abstraction Layer),
	 * condition préalable indispensable à l'exécution des lignes suivantes.
	 */
	HAL_Init();
	//HC05_set_echo_for_AT_mode();
	/* Initialisation des périphériques utilisés dans votre programme */
	BSP_GPIO_enable();

	/* Indique que les printf sont dirigés vers l'UART2 */
	BSP_SYS_set_std_usart(UART2_ID, UART2_ID, UART2_ID);

	/* Initialisation du port de la led Verte (carte Nucleo) */
	BSP_GPIO_pin_config(LED_GREEN_GPIO, LED_GREEN_PIN, GPIO_MODE_OUTPUT_PP,GPIO_NOPULL,GPIO_SPEED_FREQ_HIGH,GPIO_NO_AF);

	/* Hello student */
	//printf("Hi <Student>, can you read me?\n");

	//heartbeat();

	//ILI9341_demo();
	/* Tâche de fond, boucle infinie, Infinite loop,... quelque soit son nom vous n'en sortirez jamais */
	while (1)
	{
		//state_machine();
/*
		if( char_received(UART2_ID) )
		{
			write_LED(true);		/* write_LED? Faites un ctrl+clic dessus pour voir...
			HAL_Delay(BLINK_DELAY);	/* ... ça fonctionne aussi avec les macros, les variables. C'est votre nouveau meilleur ami
			write_LED(false);
		}*/
		//BSP_NFC03A1_demo();
		BSP_MATRIX_KEYBOARD_demo_process_main();

	}
}

void state_machine(void)
{
	uint8_t trame[256];
	uint8_t contenu[32];
	uint8_t taille;
	ISO14443A_CARD infos;
	static SendSource send_type=SEND_NONE;



	static state_e state = STATE_INIT;
	static state_e previous_state = STATE_INIT;
	//bool entry = (state!=previous_state)?true:false;	//ce booléen sera vrai seulement 1 fois après chaque changement d'état.

	bool entry = (state!=previous_state)?true:false;
	previous_state = state;

	static char buffer[5] = {0};
	static int digit_count = 0;
	static char message[50];
	// Récupération des évènements


	switch(state)
	{
		case STATE_INIT:{
		    const char *new_keyboard_keys = NULL;
			ILI9341_Init();
			BSP_NFC03A1_Init(PCD);

			BSP_UART_init(UART2_ID,115200);
			BSP_MATRIX_KEYBOARD_init(new_keyboard_keys);

			state = STATE_WAIT;
			break;
		}
		case STATE_WAIT:{
		    char c = BSP_MATRIX_KEYBOARD_process_main();

			if (c != '\0'){
				if (c >= '0' && c <= '9') {
					for(int i = 0; i < 4; i++) {
						buffer[i] = buffer[i+1];
					}
					buffer[4] = c;
					digit_count++;
				}
				else if (c == '#') {
					if (digit_count >= 4) {
						state = STATE_SEND;
						send_type=SEND_KEYBOARD;
					}
					digit_count = 0;
				}
				else {
					digit_count = 0;
				}
			}
			if(BSP_NFC03A1_read(&infos))
			{
			   state=STATE_SEND;
			   send_type=SEND_NFC;
			}
			break;
		}
		case STATE_SEND:{
			if(send_type==SEND_NONE){
				state=STATE_ERROR;
				strcpy(message,"send_type==SEND_NONE");
			}
			if(send_type == SEND_KEYBOARD){
				memcpy(contenu, buffer, 4);
				taille = 4;
			}

			if(send_type == SEND_NFC){
				for(int i=0; i<infos.UIDsize; i++)
				    {
					contenu[i] = infos.UID[i];
				    }

				    taille = infos.UIDsize;
			}
			uint8_t index = 0;

			trame[index++] = 0xBA;
			if (send_type == SEND_NFC){
				trame[index++] = 0x01;
			}else{
				trame[index++] = 0x00;
			}
			trame[index++] = taille;

			for(int i=0; i<taille; i++)
			{
				trame[index++] = contenu[i];
			}

			trame[index++] = 0xFA;

			BSP_UART_puts(UART2_ID, trame, index);
			state = STATE_WAIT_RECEPTION;
			break;
		}
		case STATE_WAIT_RECEPTION:
		{

			break;
		}
		case STATE_OPENING:
		{
			ILI9341_Puts(25,200, "ouvert", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);


			break;
		}
		case STATE_ERROR:
		{
			ILI9341_Puts(25,200, "erreur ", &Font_7x10, ILI9341_COLOR_BROWN, ILI9341_COLOR_WHITE);

			break;
		}
        default:
        {
        	break;
        }
	}

}
